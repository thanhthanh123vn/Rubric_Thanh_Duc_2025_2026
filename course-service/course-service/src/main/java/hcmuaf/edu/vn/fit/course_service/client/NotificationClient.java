package hcmuaf.edu.vn.fit.course_service.client;

import hcmuaf.edu.vn.fit.course_service.dto.request.NotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@FeignClient(name = "notification-service")
public interface NotificationClient {


    @PostMapping("/api/v1/notification-service/homework-assigned-multiple")
    void notifyHomeworkAssignedToMultipleStudents(
            @RequestBody List<String> studentIds,
            @RequestParam("senderId") String senderId,
            @RequestParam("courseId") String courseId,
            @RequestParam("assignmentId") String assignmentId,
            @RequestParam("assignmentTitle") String assignmentTitle
    );

    @PostMapping("/api/v1/notification-service/homework-updated-multiple")
    void notifyHomeworkUpdatedToMultipleStudents(
            @RequestBody List<String> studentIds,
            @RequestParam("senderId") String senderId,
            @RequestParam("courseId") String courseId,
            @RequestParam("assignmentId") String assignmentId,
            @RequestParam("assignmentTitle") String assignmentTitle
    );

    @DeleteMapping("/api/v1/notification-service/resource/{linkedResourceId}")
    void deleteNotificationsByLinkedResource(@PathVariable("linkedResourceId") String linkedResourceId);


    @PostMapping("/api/v1/notification-service/homework-submitted")
    void notifyHomeworkSubmitted(
            @RequestParam("studentId") String studentId,
            @RequestParam("lecturerId") String lecturerId,
            @RequestParam("courseId") String courseId,
            @RequestParam("submissionId") String submissionId,
            @RequestParam("studentName") String studentName,
            @RequestParam("assignmentTitle") String assignmentTitle
    );

    @PostMapping("/api/v1/notification-service")
    Object createNotification(
            @RequestParam("senderId") String senderId,
            @RequestParam("owenrID") String ownerId, // giữ đúng theo API hiện tại đang bị typo
            @RequestParam("title") String title,
            @RequestParam("content") String content
    );
}