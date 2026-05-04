package hcmuaf.edu.vn.fit.notification_service.repository;
import hcmuaf.edu.vn.fit.notification_service.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByUserId(String userId);


    List<Notification> findByUserIdAndIsReadFalse(String userId);


    long countByUserIdAndIsReadFalse(String userId);
}