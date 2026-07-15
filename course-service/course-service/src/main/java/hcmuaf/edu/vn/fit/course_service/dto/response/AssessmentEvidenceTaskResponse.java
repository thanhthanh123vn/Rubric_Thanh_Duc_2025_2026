package hcmuaf.edu.vn.fit.course_service.dto.response;

import hcmuaf.edu.vn.fit.course_service.entity.enums.TaskStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AssessmentEvidenceTaskResponse {
    private String taskId;
    private String title;
    private String groupId;
    private String groupName;
    private TaskStatus status;
    private LocalDateTime deadline;
    private LocalDateTime completedAt;
    private boolean completedLate;
    private boolean overdue;
}
