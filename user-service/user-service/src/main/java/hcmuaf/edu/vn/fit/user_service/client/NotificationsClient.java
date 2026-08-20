package hcmuaf.edu.vn.fit.user_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(
        name = "notification-service",
        url = "${clients.notification-service.url:http://localhost:8084}",
        path = "/api/v1/notification-service"
)
public interface NotificationsClient {

    @PostMapping("/send-email")
    String sendEmail(
            @RequestParam("to") String to,
            @RequestParam("subject") String subject,
            @RequestParam("content") String content
    );
}