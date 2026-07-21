package hcmuaf.edu.vn.fit.grading_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentScoreDto {
    private String studentId;
    private String fullName;
    private Double attendanceScore;
    private Double assignmentScore;
    private Double examScore;
    private String letterGrade;
}