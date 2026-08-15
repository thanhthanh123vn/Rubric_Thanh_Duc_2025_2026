package hcmuaf.edu.vn.fit.notification_service.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Getter
@Setter
public class NotificationResponse {
    private String id;
    private String title;
    private String content;
    private boolean isRead;
    private Instant createdAt;
    private String referenceUrl;
    private String courseId;
    private String notificationType;

    private String ownerId;
    private String senderId;
    private String senderName;
    private String senderAvatar;
}
