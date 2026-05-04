package hcmuaf.edu.vn.fit.course_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.List;


@FeignClient(name = "notification-service")
public interface NotificationClient {


    @PostMapping("/api/v1/notifications/homework-assigned-multiple")
    void notifyHomeworkAssignedToMultipleStudents(
            @RequestBody List<String> studentIds,
            @RequestParam("assignmentTitle") String assignmentTitle
    );

    @PostMapping("/api/v1/notifications/homework-updated-multiple")
    void notifyHomeworkUpdatedToMultipleStudents(
            @RequestBody List<Long> studentIds,
            @RequestParam("assignmentTitle") String assignmentTitle
    );
}