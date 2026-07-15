package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AssessmentEvidenceResponse {
    private String studentId;
    private int totalAssignedTasks;
    private int completedTasks;
    private int completedOnTimeTasks;
    private int completedLateTasks;
    private int overdueTasks;
    private int inProgressTasks;
    private int todoTasks;
    private double completionRate;
    private List<AssessmentEvidenceTaskResponse> tasks;
}
