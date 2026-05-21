package hcmuaf.edu.vn.fit.notification_service.controller;

import hcmuaf.edu.vn.fit.notification_service.dto.response.NotificationResponse;
import hcmuaf.edu.vn.fit.notification_service.entity.Notification;
import hcmuaf.edu.vn.fit.notification_service.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notification-service")
public class NotificationController {

    @Autowired
    private NotificationService service;

    // Gửi thông báo hệ thống chung
    @PostMapping
    public Notification create(
            @RequestParam String senderId,
            @RequestParam String owenrID,
            @RequestParam String title,
            @RequestParam String content
    ) {


        return service.sendNotification(senderId,owenrID, title, content);
    }

    // Gửi email
    @PostMapping("/email")
    public String sendEmail(
            @RequestParam String to,
            @RequestParam String subject,
            @RequestParam String content) {

        service.sendEmail(to, subject, content);
        return "Email sent!";
    }


    @GetMapping("/getNotification/me")
    public List<NotificationResponse> getUserNotifications(@RequestHeader("X-User-Id") String userId) {
        return service.getUserNotifications(userId); // Gọi hàm đã được update ở Bước 2
    }

    // Giao bài tập cho nhiều sinh viên
    @PostMapping("/homework-assigned-multiple")
    public ResponseEntity<?> notifyMultipleStudents(
            @RequestBody List<String> studentIds,
            @RequestParam("senderId") String senderId,
            @RequestParam("courseId") String courseId,
            @RequestParam("assignmentId") String assignmentId,
            @RequestParam("assignmentTitle") String assignmentTitle
    ) {
        try {
            service.notifyHomeworkAssignedToMultipleStudents(senderId, courseId, studentIds, assignmentId, assignmentTitle);
            return ResponseEntity.ok("Đã phát thông báo giao bài tập thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi gửi thông báo: " + e.getMessage());
        }
    }

    // Cập nhật bài tập cho nhiều sinh viên
    @PostMapping("/homework-updated-multiple")
    public ResponseEntity<?> notifyHomeworkUpdated(
            @RequestBody List<String> studentIds,
            @RequestParam("senderId") String senderId,
            @RequestParam("courseId") String courseId,
            @RequestParam("assignmentId") String assignmentId,
            @RequestParam("assignmentTitle") String assignmentTitle
    ) {
        try {
            List<Notification> notifications = service.notifyHomeworkUpdatedToMultipleStudents(senderId, courseId, studentIds, assignmentId, assignmentTitle);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi gửi thông báo: " + e.getMessage());
        }
    }

    // Đánh dấu 1 thông báo là đã đọc
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String notificationId) {
        try {
            Notification notification = service.markAsRead(notificationId);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }

    // Đánh dấu TẤT CẢ thông báo của user là đã đọc
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable String userId) {
        try {
            service.markAllAsRead(userId);
            return ResponseEntity.ok("Đã đánh dấu tất cả là đã đọc");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }

    // Xóa thông báo
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<?> deleteNotification(@PathVariable String notificationId) {
        try {
            service.deleteNotification(notificationId);
            return ResponseEntity.ok("Đã xóa thông báo");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xóa: " + e.getMessage());
        }
    }

    // Đếm số thông báo chưa đọc
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable String userId) {
        long count = service.countUnreadNotifications(userId);
        return ResponseEntity.ok(count);
    }
    @DeleteMapping("/resource/{linkedResourceId}")
    public ResponseEntity<?> deleteNotificationsByResource(@PathVariable String linkedResourceId) {
        try {
            service.deleteNotificationsByLinkedResourceId(linkedResourceId);
            return ResponseEntity.ok("Đã xóa các thông báo liên quan");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xóa thông báo: " + e.getMessage());
        }
    }
    // Sinh viên nộp bài
    @PostMapping("/homework-submitted")
    public ResponseEntity<?> notifyHomeworkSubmitted(
            @RequestParam("studentId") String studentId,
            @RequestParam("lecturerId") String lecturerId,
            @RequestParam("courseId") String courseId,
            @RequestParam("submissionId") String submissionId,
            @RequestParam("studentName") String studentName,
            @RequestParam("assignmentTitle") String assignmentTitle
    ) {
        try {
            Notification notif = service.notifyHomeworkSubmitted(
                    studentId, lecturerId, courseId, submissionId, studentName, assignmentTitle);
            return ResponseEntity.ok(notif);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi gửi thông báo: " + e.getMessage());
        }
    }

}