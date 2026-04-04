
package hcmuaf.edu.vn.fit.user_service.dto.request;

import java.time.LocalDate;

public record UpdateProfileRequest(
        String fullName,
        LocalDate dateOfBirth,
        String nationality,
        String cccd,
        String gender,
        String phoneNumber,
        String address
) {}