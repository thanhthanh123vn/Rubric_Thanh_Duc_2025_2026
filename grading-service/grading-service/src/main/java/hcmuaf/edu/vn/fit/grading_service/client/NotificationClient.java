package hcmuaf.edu.vn.fit.grading_service.client;

import hcmuaf.edu.vn.fit.grading_service.dto.request.NotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@FeignClient(name = "notification-service")
public interface NotificationClient {

    @PostMapping("/api/v1/notification-service")
    void sendNotification(@RequestBody NotificationRequest request);

}