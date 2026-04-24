package hcmuaf.edu.vn.fit.user_service.dto.response;


public record LecturerResponse(
        String lecturerId,
        String userId,
        String fullName,
        String email,
        String department,
        String academicTitle

) {}