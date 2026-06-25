package hcmuaf.edu.vn.fit.rubric_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseDto {
    private String courseId;
    private String courseCode;
    private String courseName;
    private String department;
}