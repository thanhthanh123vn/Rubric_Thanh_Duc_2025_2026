package hcmuaf.edu.vn.fit.grading_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GradebookResponse {
    private Double attendanceWeight;
    private Double assignmentWeight;
    private List<StudentScoreDto> students;
}