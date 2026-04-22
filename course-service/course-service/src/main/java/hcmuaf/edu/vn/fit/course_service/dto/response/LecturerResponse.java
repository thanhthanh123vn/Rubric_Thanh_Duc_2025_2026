package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Data;

@Data
public class LecturerResponse {
    private String lecturerId;
    private String userId;
    private String fullName;
    private String email;
    private String department;
    private String title;
}