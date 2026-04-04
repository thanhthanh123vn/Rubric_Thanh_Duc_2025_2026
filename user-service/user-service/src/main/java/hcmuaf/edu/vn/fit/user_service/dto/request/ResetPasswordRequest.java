package hcmuaf.edu.vn.fit.user_service.dto.request;

public record ResetPasswordRequest(
        String email,
        String otp,
        String newPassword
) {}