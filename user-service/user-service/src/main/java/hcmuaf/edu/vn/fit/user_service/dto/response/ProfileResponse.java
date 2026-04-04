package hcmuaf.edu.vn.fit.user_service.dto.response;

import lombok.Builder;
import java.time.LocalDate;

@Builder
public record ProfileResponse(
        String studentId,
        String fullName,
        String className,
        String major,
        LocalDate dateOfBirth,
        String nationality,
        String cccd,
        String gender,
        String phoneNumber,
        String address,
        String email
) {}