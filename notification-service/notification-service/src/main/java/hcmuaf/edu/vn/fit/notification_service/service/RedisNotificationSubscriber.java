package hcmuaf.edu.vn.fit.notification_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import hcmuaf.edu.vn.fit.notification_service.dto.response.NotificationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class RedisNotificationSubscriber implements MessageListener{

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            // Lấy chuỗi JSON từ Redis
            String jsonMessage = new String(message.getBody());
            NotificationResponse response = objectMapper.readValue(jsonMessage, NotificationResponse.class);



            String destination = "/topic/notifications/" + response.getOwnerId();


            messagingTemplate.convertAndSend(destination, response);

        } catch (Exception e) {
            System.err.println("Lỗi khi xử lý tin nhắn từ Redis: " + e.getMessage());
        }
    }
}