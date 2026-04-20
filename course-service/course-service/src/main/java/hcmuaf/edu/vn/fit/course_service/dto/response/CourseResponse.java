package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Data;

@Data
public class CourseResponse {
    private String courseId;
    private String courseCode;
    private String courseName;
    private Integer credits;
    private String description;
    private String department;
}