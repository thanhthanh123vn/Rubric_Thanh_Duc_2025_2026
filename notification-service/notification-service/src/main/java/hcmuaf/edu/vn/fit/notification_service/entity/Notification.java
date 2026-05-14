package hcmuaf.edu.vn.fit.notification_service.entity;

import hcmuaf.edu.vn.fit.notification_service.entity.enums.NotificationType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "notifications")
@Getter
@Setter
public class Notification extends AbstractEntity<Notification> {

    @Column(name="sender_id")
    private String senderId;

    @Column(name="owner_id")
    private String ownerId;

    @Column(name="course_id")
    private String courseId;

    @Column(name="title")
    private String title;

    @Column(name="content", columnDefinition = "TEXT")
    private String content;

    @Column(name="is_read")
    private boolean isRead = false;

    @Column(name="notification_type", length = 30)
    @Enumerated(EnumType.STRING)
    private NotificationType notificationType;
    @Column(name = "avatar_url")
    private String avatarUrl;


    @Column(name="linked_resource_id")
    private String linkedResourceId;


    @Column(name="reference_url")
    private String referenceUrl;

}