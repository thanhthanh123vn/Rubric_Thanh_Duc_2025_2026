package hcmuaf.edu.vn.fit.user_service.dto.request;

public record RegisterRequest(
        String Id,
        String fullName,
        String email,
        String password
) {}