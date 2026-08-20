package hcmuaf.edu.vn.fit.notification_service.dto.request;
public record EmailNotificationRequest(
        String toEmail,
        String subject,
        String content
) {}