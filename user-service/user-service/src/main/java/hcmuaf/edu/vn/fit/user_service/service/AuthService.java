package hcmuaf.edu.vn.fit.user_service.service;


import hcmuaf.edu.vn.fit.user_service.dto.request.ForgotPasswordRequest;
import hcmuaf.edu.vn.fit.user_service.dto.request.LoginRequest;
import hcmuaf.edu.vn.fit.user_service.dto.request.RegisterRequest;
import hcmuaf.edu.vn.fit.user_service.dto.request.ResetPasswordRequest;
import hcmuaf.edu.vn.fit.user_service.dto.response.LecturerProfileResponse;
import hcmuaf.edu.vn.fit.user_service.dto.response.LoginResponse;
import hcmuaf.edu.vn.fit.user_service.dto.response.StudentProfileResponse;
import hcmuaf.edu.vn.fit.user_service.dto.response.TokenResponse;
import hcmuaf.edu.vn.fit.user_service.entity.Lecturer;
import hcmuaf.edu.vn.fit.user_service.entity.SinhVien;
import hcmuaf.edu.vn.fit.user_service.entity.User;
import hcmuaf.edu.vn.fit.user_service.map.SinhVienMapper;
import hcmuaf.edu.vn.fit.user_service.map.UserMapper;
import hcmuaf.edu.vn.fit.user_service.repository.LecturerRepository;
import hcmuaf.edu.vn.fit.user_service.repository.UserRepository;
import hcmuaf.edu.vn.fit.user_service.repository.SinhVienRepository; // Import chuẩn ở đây
import hcmuaf.edu.vn.fit.user_service.util.JwtUtils;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final SinhVienRepository svRepository;
    private final LecturerRepository lecturerRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final EmailService emailService;
    private final JwtUtils jwtUtils;
    private final HttpSession session;
    private final SinhVienMapper svMapper;

        @Transactional
        public void register(RegisterRequest request) {
            // 1. Kiểm tra tồn tại
            if(userRepository.existsById(request.Id())) {
                throw new RuntimeException("MSSV " + request.Id() + " đã tồn tại!");
            }


            User user = userMapper.toUser(request);
            user.setPasswordHash(passwordEncoder.encode(request.password()));
            user.setRole("STUDENT");
            user.setAuthProvider("LOCAL");
            User savedUser = userRepository.save(user);


            SinhVien sv = svMapper.toEntity(request);
            sv.setUser(savedUser);

            svRepository.save(sv);
        }

    public LoginResponse login(LoginRequest request) {

        User user = null;
        boolean isEmail = request.identifier().contains("@");

        if (isEmail) {
            user = userRepository.findByEmail(request.identifier())
                    .orElseThrow(() -> new IllegalArgumentException("Tài khoản hoặc mật khẩu không chính xác!"));
        } else {
            user = userRepository.findByUsername(request.identifier())
                    .orElseThrow(() -> new IllegalArgumentException("Tài khoản hoặc mật khẩu không chính xác!"));
        }
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Tài khoản hoặc mật khẩu không chính xác!");
        }

        StudentProfileResponse studentProfile = null;
        LecturerProfileResponse lecturerProfile = null;

        if ("STUDENT".equals(user.getRole())) {
            SinhVien sv = svRepository.findByUser(user).orElse(null);
            if (sv != null) {
                studentProfile = new StudentProfileResponse(
                        sv.getStudentId(),
                        sv.getFullName(),
                        sv.getClassName(),
                        sv.getMajor()
                );
            }
        } else if ("TEACHER".equals(user.getRole())) {
            Lecturer gv = lecturerRepository.findByUser(user).orElse(null);
            if (gv != null) {
                lecturerProfile = new LecturerProfileResponse(
                        gv.getLecturerId(),
                        gv.getFullName(),
                        gv.getDepartment(),
                        gv.getAcademicTitle()
                );
            }
        }

        String token = jwtUtils.generateToken(user.getUserId(), user.getRole());
        String refreshToken = jwtUtils.generateRefreshToken(user.getUserId(), user.getRole());

        return new LoginResponse(
                token,
                user.getRole(),
                user.getUserId(),
                studentProfile,
                lecturerProfile,
                refreshToken
        );
    }


    public LoginResponse loginWithGoogle(OAuth2User oauth2User) {
        String email = oauth2User.getAttribute("email");
        String googleId = oauth2User.getAttribute("sub");

//        if (!email.endsWith("@st.hcmuaf.edu.vn") && !email.endsWith("@hcmuaf.edu.vn")) {
//            throw new RuntimeException("Email không hợp lệ!");
//        }
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .userId("GG-" + System.currentTimeMillis())
                            .email(email)
                            .role("STUDENT")
                            .authProvider("GOOGLE")
                            .googleId(googleId)
                            .build();
                    return userRepository.save(newUser);
                });

        String token = jwtUtils.generateToken(user.getUserId(), user.getRole());
        String refershToken = jwtUtils.generateRefreshToken(user.getUserId(), user.getRole());
        StudentProfileResponse studentProfile = null;
        LecturerProfileResponse lecturerProfile = null;

        String fullName = "";
        if ("STUDENT".equals(user.getRole())) {
            SinhVien sv = svRepository.findByUser(user).orElse(null);
            if (sv != null) {
                studentProfile = new StudentProfileResponse(
                        sv.getStudentId(),
                        sv.getFullName(),
                        sv.getClassName(),
                        sv.getMajor()
                );
            }
        }
        return new LoginResponse(token, user.getUserId(),user.getUsername(),studentProfile,lecturerProfile,fullName);
    }
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này!"));

        // Tạo OTP ngẫu nhiên 6 số
        String otp = String.format("%06d", new Random().nextInt(999999));


        user.setResetOtp(otp);
        user.setResetOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        // Gửi email
        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    // 2. Hàm xác nhận OTP và lưu mật khẩu mới
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản!"));


        if (user.getResetOtp() == null || !user.getResetOtp().equals(request.otp())) {
            throw new RuntimeException("Mã OTP không hợp lệ!");
        }

        if (user.getResetOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã OTP đã hết hạn!");
        }


        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));


        user.setResetOtp(null);
        user.setResetOtpExpiry(null);
        userRepository.save(user);
    }
    public TokenResponse refreshToken(String refreshToken) {
        // 1. Trích xuất thông tin từ token cũ
        String userId = jwtUtils.extractUsername(refreshToken);
        String role = jwtUtils.extractRole(refreshToken);

        // 2. Kiểm tra tính hợp lệ và hết hạn
        if (jwtUtils.isTokenValid(refreshToken) && !jwtUtils.isTokenExpired(refreshToken)) {
            // 3. Tạo cặp token mới
            String newAccessToken = jwtUtils.generateToken(userId, role);
            return new TokenResponse(newAccessToken, refreshToken);
        }

        throw new RuntimeException("Refresh token is invalid or expired");
    }

    private void clearSession() {
        // TODO Auto-generated method stub

        session.removeAttribute("otp");
        session.removeAttribute("register_request");
        session.removeAttribute("otp_exp");

    }
}

