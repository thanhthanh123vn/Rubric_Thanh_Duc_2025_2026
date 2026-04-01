package hcmuaf.edu.vn.fit.user_service.dto.response;

import lombok.Builder;

@Builder
public record LoginResponse(
        String token,
        String studentId,
        String role
) {}