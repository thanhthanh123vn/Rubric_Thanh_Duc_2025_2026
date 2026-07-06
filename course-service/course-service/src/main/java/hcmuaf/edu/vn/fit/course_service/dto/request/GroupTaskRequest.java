package hcmuaf.edu.vn.fit.course_service.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GroupTaskRequest {
    private String groupId;
    private String title;
    private String description;
    private String assigneeId;
    private Boolean assignToGroup;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime deadline;
}
