package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentCourseResponse {
    private String studentId;
    private String fullName;
    private String email;
    private LocalDateTime enrollmentDate;
    private Float midtermScore;
    private Float finalScore;
    private Float totalScore;
    private String letterGrade;

}