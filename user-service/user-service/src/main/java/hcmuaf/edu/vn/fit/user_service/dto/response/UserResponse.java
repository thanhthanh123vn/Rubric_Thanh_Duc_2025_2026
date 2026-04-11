package hcmuaf.edu.vn.fit.user_service.dto.response;


public record UserResponse(
        String userId,
        String username,
        String email,
        String role,
        String authProvider
) {
}