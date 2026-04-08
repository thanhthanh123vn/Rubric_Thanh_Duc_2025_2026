package hcmuaf.edu.vn.fit.user_service.dto.request.admin;


public record UpdateUserRequest(
        String username,
        String email,
        String role
) {}