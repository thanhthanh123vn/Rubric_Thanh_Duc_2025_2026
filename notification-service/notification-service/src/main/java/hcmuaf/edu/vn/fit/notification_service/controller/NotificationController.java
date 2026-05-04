package hcmuaf.edu.vn.fit.notification_service.controller;

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

    @PostMapping
    public Notification create(
            @RequestParam String userId,
            @RequestParam String message) {

        return service.sendNotification(userId, message);
    }

    @PostMapping("/email")
    public String sendEmail(
            @RequestParam String to,
            @RequestParam String subject,
            @RequestParam String content) {

        service.sendEmail(to, subject, content);
        return "Email sent!";
    }

    @GetMapping("/getNotification/me")
    public List<Notification> getUserNotifications(@RequestHeader("X-User-Id") String userId) {
        return service.getUserNotifications(userId);
    }
    @PostMapping("/homework-assigned-multiple")
    public ResponseEntity<?> notifyMultipleStudents(
            @RequestBody List<String> studentIds,
            @RequestParam("assignmentTitle") String assignmentTitle
    ) {

        service.notifyHomeworkAssignedToMultipleStudents(studentIds, assignmentTitle);
        return ResponseEntity.ok("Đã phát thông báo");
    }

    @PostMapping("/homework-updated-multiple")
    public ResponseEntity<?> notifyHomeworkUpdated(
            @RequestBody List<String> studentIds,
            @RequestParam("assignmentTitle") String assignmentTitle
    ) {
        try {
            List<Notification> notifications = service.notifyHomeworkUpdatedToMultipleStudents(studentIds, assignmentTitle);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi gửi thông báo: " + e.getMessage());
        }
    }
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String notificationId) {
        try {
            Notification notification = service.markAsRead(notificationId);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable String userId) {
        try {
            service.markAllAsRead(userId);
            return ResponseEntity.ok("Đã đánh dấu tất cả là đã đọc");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<?> deleteNotification(@PathVariable String notificationId) {
        try {
            service.deleteNotification(notificationId);
            return ResponseEntity.ok("Đã xóa thông báo");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xóa: " + e.getMessage());
        }
    }
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable String userId) {
        long count = service.countUnreadNotifications(userId);
        return ResponseEntity.ok(count);
    }
}