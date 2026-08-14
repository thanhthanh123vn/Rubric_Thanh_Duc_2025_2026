package hcmuaf.edu.vn.fit.course_service.entity;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@Document(collection = "system_logs")
@CompoundIndex(name = "level_created_idx", def = "{'level': 1, 'createdAt': -1}")
public class SystemLog {
    @Id
    private String id;
    private String level;
    @TextIndexed
    private String action;
    @TextIndexed
    private String message;
    @TextIndexed(weight = 3)
    private String username;
    @TextIndexed
    private String ipAddress;
    @Indexed(expireAfterSeconds = 2592000)
    private LocalDateTime timestamp;
}