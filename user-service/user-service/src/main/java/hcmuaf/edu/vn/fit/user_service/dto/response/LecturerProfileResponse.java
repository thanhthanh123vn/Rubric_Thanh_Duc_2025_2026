package hcmuaf.edu.vn.fit.user_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Builder
public record LecturerProfileResponse(
        String lecturerId,
        String fullName,
        String department,
        String academicTitle
) {
}
