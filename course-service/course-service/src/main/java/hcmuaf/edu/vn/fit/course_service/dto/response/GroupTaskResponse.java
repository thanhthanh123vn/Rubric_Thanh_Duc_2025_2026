package hcmuaf.edu.vn.fit.course_service.dto.response;

import hcmuaf.edu.vn.fit.course_service.entity.enums.TaskStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class GroupTaskResponse {
    private String id;
    private String title;
    private String description;
    private String assigneeId;
    private Boolean assignToGroup;
    private String assignerId;
    private TaskStatus status;
    private LocalDateTime deadline;
    private LocalDateTime createdAt;
    private String resultNote;
    private String resultLink;
    private String resultFileUrl;
    private String completedById;
    private LocalDateTime completedAt;
}
