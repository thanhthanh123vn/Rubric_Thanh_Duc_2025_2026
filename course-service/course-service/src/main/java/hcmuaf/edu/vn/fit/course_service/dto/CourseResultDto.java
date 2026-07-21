package hcmuaf.edu.vn.fit.course_service.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResultDto {
    private String courseCode;
    private String courseName;
    private Integer credits;
    private Double score10;       // thang 10
    private String scoreLetter;   // A/B+/C...
    private String status;        // PASS/FAIL
}