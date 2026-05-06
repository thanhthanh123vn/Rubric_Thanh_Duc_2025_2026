package hcmuaf.edu.vn.fit.notification_service.repository;
import hcmuaf.edu.vn.fit.notification_service.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findByOwnerId(String ownerId);


    List<Notification> findByOwnerIdAndIsReadFalse(String ownerId);


    long countByOwnerIdAndIsReadFalse(String ownerId);

    @Transactional
    void deleteByLinkedResourceId(String linkedResourceId);
}