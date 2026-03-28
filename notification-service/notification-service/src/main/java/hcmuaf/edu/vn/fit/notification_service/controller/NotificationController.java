package hcmuaf.edu.vn.fit.notification_service.controller;

import hcmuaf.edu.vn.fit.notification_service.entity.Notification;
import hcmuaf.edu.vn.fit.notification_service.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    @Autowired
    private NotificationService service;

    @PostMapping
    public Notification create(
            @RequestParam Long userId,
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

    @GetMapping("/{userId}")
    public List<Notification> getUserNotifications(@PathVariable Long userId) {
        return service.getUserNotifications(userId);
    }
}