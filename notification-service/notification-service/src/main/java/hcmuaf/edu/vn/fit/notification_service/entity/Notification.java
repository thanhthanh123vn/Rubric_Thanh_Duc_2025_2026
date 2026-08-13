package hcmuaf.edu.vn.fit.notification_service.entity;

import hcmuaf.edu.vn.fit.notification_service.entity.enums.NotificationType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "notifications")
@Getter
@Setter
public class Notification extends AbstractEntity<Notification> {

    @Field("sender_id")
    private String senderId;

    @Field("owner_id")
    private String ownerId;

    @Field("course_id")
    private String courseId;

    @Field("title")
    private String title;

    @Field("content")
    private String content;

    @Field("is_read")
    private boolean isRead = false;

    @Field("notification_type")
    private NotificationType notificationType;

    @Field("avatar_url")
    private String avatarUrl;

    @Field("linked_resource_id")
    private String linkedResourceId;

    @Field("reference_url")
    private String referenceUrl;

}