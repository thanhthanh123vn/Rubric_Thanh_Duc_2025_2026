package hcmuaf.edu.vn.fit.user_service.service;

import hcmuaf.edu.vn.fit.user_service.dto.request.ForgotPasswordRequest;
import hcmuaf.edu.vn.fit.user_service.dto.request.LoginRequest;
import hcmuaf.edu.vn.fit.user_service.dto.request.RegisterRequest;
import hcmuaf.edu.vn.fit.user_service.dto.request.ResetPasswordRequest;
import hcmuaf.edu.vn.fit.user_service.dto.response.LoginResponse;
import hcmuaf.edu.vn.fit.user_service.entity.SinhVien;
import hcmuaf.edu.vn.fit.user_service.entity.User;
import hcmuaf.edu.vn.fit.user_service.map.SinhVienMapper;
import hcmuaf.edu.vn.fit.user_service.map.UserMapper;
import hcmuaf.edu.vn.fit.user_service.repository.UserRepository;
import hcmuaf.edu.vn.fit.user_service.repository.SinhVienRepository; // Import chuẩn ở đây
import hcmuaf.edu.vn.fit.user_service.util.JwtUtils;
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
    private final BCryptPasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final EmailService emailService;
    private final JwtUtils jwtUtils;

        private final SinhVienMapper svMapper;

        @Transactional
        public void register(RegisterRequest request) {
            // 1. Kiểm tra tồn tại
            if(userRepository.existsById(request.studentId())) {
                throw new RuntimeException("MSSV " + request.studentId() + " đã tồn tại!");
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
        User user = userRepository.findByUsername(request.identifier())
                .orElseThrow(() -> new RuntimeException("Sai tài khoản!"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new RuntimeException("Sai mật khẩu!");
        }

        String fullName = "";
        if ("STUDENT".equals(user.getRole())) {
            SinhVien sv = svRepository.findByUser(user).orElse(null);
            if (sv != null) {
                fullName = sv.getFullName();
            }
        }
        String token = jwtUtils.generateToken(user.getUserId(), user.getRole());
        return new LoginResponse(token, user.getUserId(),user.getUsername(), user.getRole(),fullName);
    }


    public LoginResponse loginWithGoogle(OAuth2User oauth2User) {
        String email = oauth2User.getAttribute("email");
        String googleId = oauth2User.getAttribute("sub");

        if (!email.endsWith("@st.hcmuaf.edu.vn") && !email.endsWith("@hcmuaf.edu.vn")) {
            throw new RuntimeException("Email không hợp lệ!");
        }
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
        String fullName = "";
        if ("STUDENT".equals(user.getRole())) {
            SinhVien sv = svRepository.findByUser(user).orElse(null);
            if (sv != null) {
                fullName = sv.getFullName();
            }
        }
        return new LoginResponse(token, user.getUserId(),user.getUsername(), user.getRole(),fullName);
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
}

