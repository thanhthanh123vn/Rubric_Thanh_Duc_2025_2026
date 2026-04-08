package hcmuaf.edu.vn.fit.user_service.dto.request.admin;


public record CreateUserRequest(
        String userId,
        String username,
        String email,
        String password,
        String role
) {}