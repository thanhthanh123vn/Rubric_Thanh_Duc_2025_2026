package hcmuaf.edu.vn.fit.notification_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import hcmuaf.edu.vn.fit.notification_service.entity.Notification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class RedisNotificationSubscriber {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;


    public void onMessage(String message) {
        try {

            Notification notification = objectMapper.readValue(message, Notification.class);


            //  Frontend subscribe vào "/topic/user/1" để nhận thông báo của user có ID = 1
            messagingTemplate.convertAndSend("/topic/user/" + notification.getUserId(), notification);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}