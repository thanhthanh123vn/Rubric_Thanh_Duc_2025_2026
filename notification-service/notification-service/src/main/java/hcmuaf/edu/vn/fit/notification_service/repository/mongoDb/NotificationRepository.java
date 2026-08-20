package hcmuaf.edu.vn.fit.notification_service.repository.mongoDb;

import hcmuaf.edu.vn.fit.notification_service.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByOwnerId(String ownerId);

    List<Notification> findByOwnerIdAndIsReadFalse(String ownerId);
    List<Notification> findBySenderIdOrderByCreatedAtDesc(String senderId);
    long countByOwnerIdAndIsReadFalse(String ownerId);

    @Transactional
    void deleteByLinkedResourceId(String linkedResourceId);

    List<Notification> findByOwnerIdOrderByCreatedAtDesc(String userId);
}