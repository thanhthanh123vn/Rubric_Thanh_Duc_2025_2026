package hcmuaf.edu.vn.fit.user_service.dto.request;

public record RegisterRequest(
        String studentId,
        String fullName,
        String email,
        String password
) {}