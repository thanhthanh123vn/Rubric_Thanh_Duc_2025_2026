package hcmuaf.edu.vn.fit.user_service.dto.response;

import lombok.Builder;

@Builder
public record StudentProfileResponse(
        String studentId,
        String fullName,
        String className,
        String major
) {
}
