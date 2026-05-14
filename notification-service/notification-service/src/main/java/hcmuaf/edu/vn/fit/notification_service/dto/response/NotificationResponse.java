package hcmuaf.edu.vn.fit.notification_service.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class NotificationResponse {
    private String id;
    private String title;
    private String content;
    private boolean isRead;
    private LocalDateTime createdAt;
    private String referenceUrl;


    private String senderId;
    private String senderName;
    private String senderAvatar;
}