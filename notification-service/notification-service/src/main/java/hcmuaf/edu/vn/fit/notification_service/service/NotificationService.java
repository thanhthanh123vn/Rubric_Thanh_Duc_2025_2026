package hcmuaf.edu.vn.fit.notification_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import hcmuaf.edu.vn.fit.notification_service.entity.Notification;
import hcmuaf.edu.vn.fit.notification_service.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository repo;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private ObjectMapper objectMapper;


    private Notification saveAndBroadcast(Notification n) {
        Notification saved = repo.save(n);
        try {

            String jsonMessage = objectMapper.writeValueAsString(saved);

            redisTemplate.convertAndSend("notification-channel", jsonMessage);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return saved;
    }


    public Notification notifyHomeworkAssigned(String studentId, String assignmentTitle) {
        Notification n = new Notification();
        n.setUserId(studentId);
        n.setMessage("Giảng viên đã giao bài tập mới: " + assignmentTitle);
        n.setType("HOMEWORK_ASSIGNED");
        n.setCreatedAt(LocalDateTime.now());

        return saveAndBroadcast(n);
    }


    public List<Notification> notifyHomeworkAssignedToMultipleStudents(List<String> studentIds, String assignmentTitle) {
        List<Notification> notifications = studentIds.stream().map(studentId -> {
            Notification n = new Notification();
            n.setUserId(studentId);
            n.setMessage("Giảng viên đã giao bài tập mới: " + assignmentTitle);
            n.setType("HOMEWORK_ASSIGNED");
            n.setCreatedAt(LocalDateTime.now());
            return n;
        }).collect(Collectors.toList());

        List<Notification> savedList = repo.saveAll(notifications);

        // Broadcast từng thông báo cho từng sinh viên
        savedList.forEach(n -> {
            try {
                redisTemplate.convertAndSend("notification-channel", objectMapper.writeValueAsString(n));
            } catch (Exception e) {}
        });

        return savedList;
    }


    public Notification notifyHomeworkSubmitted(String lecturerId, String studentName, String assignmentTitle) {
        Notification n = new Notification();
        n.setUserId(lecturerId);
        n.setMessage("Sinh viên " + studentName + " vừa nộp bài tập: " + assignmentTitle);
        n.setType("HOMEWORK_SUBMITTED");
        n.setCreatedAt(LocalDateTime.now());

        return saveAndBroadcast(n);
    }

    public Notification sendNotification(String userId, String message) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setMessage(message);
        n.setType("SYSTEM");
        n.setCreatedAt(LocalDateTime.now());
        return repo.save(n);
    }

    public void sendEmail(String to, String subject, String content) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(to);
        mail.setSubject(subject);
        mail.setText(content);
        mailSender.send(mail);
    }

    public List<Notification> getUserNotifications(String userId) {
        return repo.findByUserId(userId);
    }
    public List<Notification> notifyHomeworkUpdatedToMultipleStudents(List<String> studentIds, String assignmentTitle) {
        List<Notification> notifications = studentIds.stream().map(studentId -> {
            Notification n = new Notification();
            n.setUserId(studentId);
            n.setMessage("Giảng viên đã cập nhật bài tập: " + assignmentTitle);
            n.setType("HOMEWORK_UPDATED");
            n.setCreatedAt(LocalDateTime.now());
            return n;
        }).collect(Collectors.toList());

        List<Notification> savedList = repo.saveAll(notifications);

        // Broadcast cho từng sinh viên qua Redis
        savedList.forEach(n -> {
            try {
                redisTemplate.convertAndSend("notification-channel", objectMapper.writeValueAsString(n));
            } catch (Exception e) {}
        });

        return savedList;
    }
    @Transactional
    public Notification markAsRead(String notificationId) {
        Notification notification = repo.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo: " + notificationId));

        notification.setRead(true);
        return repo.save(notification);
    }

    // 2. Đánh dấu tất cả thông báo của một user là đã đọc
    @Transactional
    public void markAllAsRead(String userId) {

        List<Notification> unreadNotifications = repo.findByUserIdAndIsReadFalse(userId);

        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }

        repo.saveAll(unreadNotifications);
    }


    @Transactional
    public void deleteNotification(String notificationId) {
        if (!repo.existsById(notificationId)) {
            throw new RuntimeException("Thông báo không tồn tại để xóa");
        }
        repo.deleteById(notificationId);
    }


    public long countUnreadNotifications(String userId) {
        return repo.countByUserIdAndIsReadFalse(userId);
    }
}