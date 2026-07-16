package hcmuaf.edu.vn.fit.grading_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentGradeDto {
    private String studentId;
    private String studentCode;
    private String studentName;
    private Double score;
    private String feedback;
}