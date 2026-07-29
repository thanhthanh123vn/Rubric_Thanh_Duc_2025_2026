package hcmuaf.edu.vn.fit.user_service.dto.response;


import java.time.LocalDate;

public record LecturerResponse(
        String lecturerId,
        String userId,
        String fullName,
        String email,
        String department,
        String academicTitle,
        LocalDate dateOfBirth,
        String gender,
        String cccd,
        String phoneNumber,
        String address

) {}