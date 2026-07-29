package hcmuaf.edu.vn.fit.user_service.dto.request;

import java.time.LocalDate;

public record UpdateLecturerProfileRequest(
        String fullName,
        LocalDate dateOfBirth,
        String gender,
        String cccd,
        String phoneNumber,
        String address
) {}