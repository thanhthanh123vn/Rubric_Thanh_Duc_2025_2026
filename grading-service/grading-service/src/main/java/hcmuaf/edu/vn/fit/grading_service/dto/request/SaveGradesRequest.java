package hcmuaf.edu.vn.fit.grading_service.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class SaveGradesRequest {
    private String assessmentId;
    private List<StudentGradeDto> grades;
}