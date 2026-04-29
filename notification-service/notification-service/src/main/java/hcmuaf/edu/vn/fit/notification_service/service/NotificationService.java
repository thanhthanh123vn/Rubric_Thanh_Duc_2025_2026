package hcmuaf.edu.vn.fit.notification_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import hcmuaf.edu.vn.fit.notification_service.entity.Notification;
import hcmuaf.edu.vn.fit.notification_service.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

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


    public Notification notifyHomeworkAssigned(Long studentId, String assignmentTitle) {
        Notification n = new Notification();
        n.setUserId(studentId);
        n.setMessage("Giảng viên đã giao bài tập mới: " + assignmentTitle);
        n.setType("HOMEWORK_ASSIGNED");
        n.setCreatedAt(LocalDateTime.now());

        return saveAndBroadcast(n);
    }


    public List<Notification> notifyHomeworkAssignedToMultipleStudents(List<Long> studentIds, String assignmentTitle) {
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

    // 3. Sinh viên nộp bài
    public Notification notifyHomeworkSubmitted(Long lecturerId, String studentName, String assignmentTitle) {
        Notification n = new Notification();
        n.setUserId(lecturerId);
        n.setMessage("Sinh viên " + studentName + " vừa nộp bài tập: " + assignmentTitle);
        n.setType("HOMEWORK_SUBMITTED");
        n.setCreatedAt(LocalDateTime.now());

        return saveAndBroadcast(n);
    }

    public Notification sendNotification(Long userId, String message) {
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

    public List<Notification> getUserNotifications(Long userId) {
        return repo.findByUserId(userId);
    }
}