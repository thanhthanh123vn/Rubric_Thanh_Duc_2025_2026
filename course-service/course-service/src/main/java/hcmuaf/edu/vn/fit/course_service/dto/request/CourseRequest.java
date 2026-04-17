package hcmuaf.edu.vn.fit.course_service.dto.request;

import lombok.Data;

@Data
public class CourseRequest {
    private String courseCode;
    private String courseName;
    private Integer credits;
    private String description;
    private String department;
}