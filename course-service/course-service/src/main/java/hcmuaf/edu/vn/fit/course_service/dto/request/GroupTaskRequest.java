package hcmuaf.edu.vn.fit.course_service.dto.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GroupTaskRequest {
    private String groupId;
    private String title;
    private String description;
    private String assigneeId;
    private LocalDateTime deadline;
}