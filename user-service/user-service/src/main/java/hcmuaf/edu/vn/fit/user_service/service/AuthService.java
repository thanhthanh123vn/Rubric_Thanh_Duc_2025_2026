package hcmuaf.edu.vn.fit.user_service.service;

import hcmuaf.edu.vn.fit.user_service.dto.request.LoginRequest;
import hcmuaf.edu.vn.fit.user_service.dto.request.RegisterRequest;
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

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final SinhVienRepository svRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
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

        String token = jwtUtils.generateToken(user.getUserId(), user.getRole());
        return new LoginResponse(token, user.getUserId(), user.getRole());
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
        return new LoginResponse(token, user.getUserId(), user.getRole());
    }
}

