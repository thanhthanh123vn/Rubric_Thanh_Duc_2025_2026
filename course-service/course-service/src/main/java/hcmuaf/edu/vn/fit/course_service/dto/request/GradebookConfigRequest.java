package hcmuaf.edu.vn.fit.course_service.dto.request;

import lombok.Data;

@Data
public class GradebookConfigRequest {
    private Double attendanceWeight;
    private Double assignmentWeight;
}
