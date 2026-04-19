package hcmuaf.edu.vn.fit.user_service.controller;

import hcmuaf.edu.vn.fit.user_service.dto.request.ForgotPasswordRequest;
import hcmuaf.edu.vn.fit.user_service.dto.request.LoginRequest;
import hcmuaf.edu.vn.fit.user_service.dto.request.RegisterRequest;
import hcmuaf.edu.vn.fit.user_service.dto.request.ResetPasswordRequest;
import hcmuaf.edu.vn.fit.user_service.dto.response.LoginResponse;
import hcmuaf.edu.vn.fit.user_service.dto.response.TokenResponse;
import hcmuaf.edu.vn.fit.user_service.service.AuthService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
@RestController
@RequestMapping("/api/v1/user-service/auth")
@RequiredArgsConstructor

public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok("Đăng ký thành công sinh viên " + request.Id());
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/oauth2-success")
    public ResponseEntity<LoginResponse> googleSuccess(@AuthenticationPrincipal OAuth2User principal) {
        return ResponseEntity.ok(authService.loginWithGoogle(principal));
    }
    @GetMapping("/user-info")
    public ResponseEntity<?> getUserInfo(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body("Chưa đăng nhập!");
        }

        return ResponseEntity.ok(authentication.getPrincipal());
    }
    @PostMapping("/refresh-token")
    public ResponseEntity<TokenResponse> refreshToken(@CookieValue String refreshToken) {

        TokenResponse response = authService.refreshToken(refreshToken);

        return ResponseEntity.status(200).body(response);

    }
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok("Mã OTP đã được gửi đến email của bạn.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Đổi mật khẩu thành công. Vui lòng đăng nhập lại!");
    }

}