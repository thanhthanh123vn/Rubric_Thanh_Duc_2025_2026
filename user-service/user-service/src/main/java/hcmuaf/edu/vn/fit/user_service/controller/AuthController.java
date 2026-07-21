package hcmuaf.edu.vn.fit.user_service.controller;

import hcmuaf.edu.vn.fit.user_service.client.ClientIpUtil;
import hcmuaf.edu.vn.fit.user_service.client.CourseClient;
import hcmuaf.edu.vn.fit.user_service.dto.request.*;
import hcmuaf.edu.vn.fit.user_service.dto.response.LoginResponse;
import hcmuaf.edu.vn.fit.user_service.dto.response.TokenResponse;
import hcmuaf.edu.vn.fit.user_service.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Enumeration;

@RestController
@RequestMapping("/api/v1/user-service/auth")
@RequiredArgsConstructor

public class AuthController {

    private final AuthService authService;
    private final CourseClient courseClient;

    @PostMapping("/register")
    public ResponseEntity<String> register( @RequestHeader(value = "X-User-Username", required = false,defaultValue = "admin") String userName,
                                           @RequestBody RegisterRequest request,
                                           HttpServletRequest httpServletRequest) {
        if ( request == null)
            return ResponseEntity.badRequest().body(" Register Not null");


        try {
            String ip = ClientIpUtil.getClientIp(httpServletRequest);
            courseClient.writeLog(
                    SystemLogRequest.builder()
                            .level("INFO")
                            .action("CREATE USER")
                            .message("Đăng Ký User")
                            .username(userName)
                            .ip(ip)
                            .build()
            );


        } catch (Exception e) {
            String ip = ClientIpUtil.getClientIp(httpServletRequest);
            courseClient.writeLog(
                    SystemLogRequest.builder()
                            .level("WARN")
                            .action("WARN CREATE USER")
                            .message("Lỗi Đăng Ký User")
                            .username(userName)
                            .ip(ip)
                            .build()
            );
        }
        authService.register(request);
        return ResponseEntity.ok("Đăng ký thành công sinh viên " + request.Id());
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        LoginResponse response = authService.login(request);

//        String ip = ClientIpUtil.getClientIp(httpRequest);
//
//        courseClient.writeLog(
//                SystemLogRequest.builder()
//                        .level("INFO")
//                        .action("LOGIN")
//                        .message("Đăng nhập thành công")
//                        .username(request.identifier()) // hoặc request.getEmail()
//                        .ip(ip)
//                        .build()
//        );

        return ResponseEntity.ok(response);
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
    public ResponseEntity<String> forgotPassword(@RequestHeader("X-User-Username") String userName,
                                                 @RequestBody ForgotPasswordRequest request,
                                                 HttpServletRequest httpServletRequest) {
        if(userName == null || request == null)
            return ResponseEntity.badRequest().body("UserName Not Null OR Register Not null");
        try{
            String ip = ClientIpUtil.getClientIp(httpServletRequest);
            courseClient.writeLog(
                    SystemLogRequest.builder()
                            .level("INFO")
                            .action("FORGOT PASSWORD")
                            .message("Quên Mật Khẩu")
                            .username(userName)
                            .ip(ip)
                            .build()
            );

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        authService.forgotPassword(request);
        return ResponseEntity.ok("Mã OTP đã được gửi đến email của bạn.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Đổi mật khẩu thành công. Vui lòng đăng nhập lại!");
    }

}