package hcmuaf.edu.vn.fit.notification_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import hcmuaf.edu.vn.fit.notification_service.client.UserClient;
import hcmuaf.edu.vn.fit.notification_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.notification_service.dto.response.NotificationResponse;
import hcmuaf.edu.vn.fit.notification_service.dto.response.SinhVienResponse;
import hcmuaf.edu.vn.fit.notification_service.dto.response.UserResponse;
import hcmuaf.edu.vn.fit.notification_service.entity.Notification;
import hcmuaf.edu.vn.fit.notification_service.entity.enums.NotificationType;
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
    private  UserClient userClient;

    @Autowired
    private ObjectMapper objectMapper;

    // Hàm dùng chung để lưu và phát qua Redis
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

    // Giao bài tập cho 1 sinh viên
    public Notification notifyHomeworkAssigned(String senderId, String studentId, String courseId, String assignmentId, String assignmentTitle) {
        Notification n = new Notification();
        n.setSenderId(senderId);
        n.setOwnerId(studentId);
        n.setCourseId(courseId);
        n.setTitle("Bài tập mới");
        n.setContent("Giảng viên đã giao bài tập mới: " + assignmentTitle);
        n.setNotificationType(NotificationType.ASSIGNMENT_NEW);
        n.setLinkedResourceId(assignmentId);
        n.setReferenceUrl("/courses/" + courseId + "/assignments/" + assignmentId);


        return saveAndBroadcast(n);
    }

    // Giao bài tập cho nhiều sinh viên
    public List<Notification> notifyHomeworkAssignedToMultipleStudents(String senderId, String courseId, List<String> studentIds, String assignmentId, String assignmentTitle) {
        List<Notification> notifications = studentIds.stream().map(studentId -> {
            Notification n = new Notification();
            n.setSenderId(senderId);
            n.setOwnerId(studentId);
            n.setCourseId(courseId);
//            try{
//                String userCurId = userClient.getUserIdByLecturerId(senderId);
//                UserResponse userResponse = userClient.getUser(userCurId);
////                n.setAvatarUrl(userResponse.getAvatarUrl());
//
//
//
//            } catch (Exception e) {
//                throw new RuntimeException("không tìm thấy giảng viên");
//            }

            n.setTitle("Bài tập mới");
            n.setContent("Giảng viên đã giao bài tập mới: " + assignmentTitle);
            n.setNotificationType(NotificationType.ASSIGNMENT_NEW);
            n.setLinkedResourceId(assignmentId);
            n.setReferenceUrl("/course/" + courseId + "/assignments/" + assignmentId);
            return n;
        }).collect(Collectors.toList());

        List<Notification> savedList = repo.saveAll(notifications);
        System.out.println(savedList);
        // Broadcast từng thông báo cho từng sinh viên
        savedList.forEach(n -> {
            try {
                redisTemplate.convertAndSend("notification-channel", objectMapper.writeValueAsString(n));
            } catch (Exception e) {}
        });

        return savedList;
    }

    // Sinh viên nộp bài cho giảng viên
    public Notification notifyHomeworkSubmitted(String studentId, String lecturerId, String courseId, String submissionId, String studentName, String assignmentTitle) {
        Notification n = new Notification();
        n.setSenderId(studentId);
        n.setOwnerId(lecturerId); // Người nhận là giảng viên
        n.setCourseId(courseId);
        n.setTitle("Nộp bài tập");
        try{

            UserResponse userResponse = userClient.getUser(studentId);
            n.setAvatarUrl(userResponse.getAvatarUrl());



        } catch (Exception e) {
            throw new RuntimeException("không tìm thấy giảng viên");
        }
        n.setContent("Sinh viên " + studentName + " vừa nộp bài tập: " + assignmentTitle);
        n.setNotificationType(NotificationType.COURSE_ANNOUNCEMENT);
        n.setLinkedResourceId(submissionId);
        n.setReferenceUrl("/course/" + courseId + "/submissions/" + submissionId);

        return saveAndBroadcast(n);
    }

    // Gửi thông báo hệ thống chung
    public Notification sendNotification(String senderId,String owenrID,String title, String content) {
        Notification n = new Notification();
        n.setSenderId(senderId);
        n.setOwnerId(owenrID);
        n.setTitle(title);
        n.setContent(content);
        n.setNotificationType(NotificationType.SYSTEM_ALERT);
        return repo.save(n);
    }

    // Cập nhật bài tập cho nhiều sinh viên
    public List<Notification> notifyHomeworkUpdatedToMultipleStudents(String senderId, String courseId, List<String> studentIds, String assignmentId, String assignmentTitle) {
        List<Notification> notifications = studentIds.stream().map(studentId -> {
            Notification n = new Notification();
            n.setSenderId(senderId);
            n.setOwnerId(studentId);
            n.setCourseId(courseId);
            n.setTitle("Cập nhật bài tập");
            n.setContent("Giảng viên đã cập nhật bài tập: " + assignmentTitle);
            n.setNotificationType(NotificationType.ASSIGNMENT_NEW);
            n.setLinkedResourceId(assignmentId);
            n.setReferenceUrl("/course/" + courseId + "/assignments/" + assignmentId);

            return n;
        }).collect(Collectors.toList());

        List<Notification> savedList = repo.saveAll(notifications);

        savedList.forEach(n -> {
            try {
                redisTemplate.convertAndSend("notification-channel", objectMapper.writeValueAsString(n));
            } catch (Exception e) {}
        });

        return savedList;
    }

    // Lấy thông báo theo ownerId

    public List<NotificationResponse> getUserNotifications(String userId) {
        List<Notification> notifications = repo.findByOwnerIdOrderByCreatedAtDesc(userId); // Hoặc hàm lấy list tương ứng của bạn

        return notifications.stream().map(notif -> {
            NotificationResponse dto = new NotificationResponse();
            dto.setId(notif.getId());
            dto.setTitle(notif.getTitle());
            dto.setContent(notif.getContent());
            dto.setRead(notif.isRead());
            dto.setCreatedAt(LocalDateTime.from(notif.getCreatedAt()));
            dto.setReferenceUrl(notif.getReferenceUrl());
            dto.setSenderId(notif.getSenderId());


            try {
                if (notif.getSenderId() != null) {
                    String senderId = notif.getSenderId();
                    boolean isFound = false;


                    try {
                        UserResponse user = userClient.getUser(senderId);
                        if (user != null && user.getFullName() != null) {
                            dto.setSenderName(user.getFullName());
                            dto.setSenderAvatar(user.getAvatarUrl());
                            isFound = true;
                        }
                    } catch (Exception ignored) {

                    }


                    if (!isFound) {
                        try {
                            LecturerResponse lecturer = userClient.getLecturer(senderId);
                            if (lecturer != null && lecturer.getFullName() != null) {
                                UserResponse userResponse = userClient.getUser(lecturer.getUserId());
                                dto.setSenderName(userResponse.getFullName());
                                dto.setSenderAvatar(userResponse.getAvatarUrl());


                                isFound = true;
                            }
                        } catch (Exception ignored) {}
                    }

                    if (!isFound) {
                        dto.setSenderName("Hệ thống LMS");
                    }
                } else {
                    dto.setSenderName("Hệ thống LMS");
                }
            } catch (Exception e) {
                System.err.println("Lỗi khi lấy thông tin người gửi: " + e.getMessage());
                dto.setSenderName("Hệ thống LMS");
            }

            return dto;
        }).collect(Collectors.toList());
    }
    @Transactional
    public Notification markAsRead(String notificationId) {
        Notification notification = repo.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo: " + notificationId));

        notification.setRead(true);
        return repo.save(notification);
    }

    @Transactional
    public void markAllAsRead(String userId) {

        List<Notification> unreadNotifications = repo.findByOwnerIdAndIsReadFalse(userId);

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

        return repo.countByOwnerIdAndIsReadFalse(userId);
    }

    public void sendEmail(String to, String subject, String content) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(to);
        mail.setSubject(subject);
        mail.setText(content);
        mailSender.send(mail);
    }
    @Transactional
    public void deleteNotificationsByLinkedResourceId(String linkedResourceId) {
        repo.deleteByLinkedResourceId(linkedResourceId);
    }
}