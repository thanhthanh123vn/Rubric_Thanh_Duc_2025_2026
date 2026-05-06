package hcmuaf.edu.vn.fit.course_service.client;

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
}