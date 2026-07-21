package hcmuaf.edu.vn.fit.course_service.entity;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@Document(collection = "system_logs")
public class SystemLog {
    @Id
    private String id;
    private String level;
    private String action;
    private String message;
    private String username;
    private String ipAddress;
    private LocalDateTime timestamp;
}