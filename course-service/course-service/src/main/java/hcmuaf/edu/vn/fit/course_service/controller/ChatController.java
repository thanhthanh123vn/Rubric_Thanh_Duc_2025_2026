package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.MessageRequest;
import hcmuaf.edu.vn.fit.course_service.entity.Message;
import hcmuaf.edu.vn.fit.course_service.repository.MessageRepository;
import hcmuaf.edu.vn.fit.course_service.repository.CourseOfferingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageRepository messageRepository;
    private final CourseOfferingRepository offeringRepository;

    // Client gửi tin nhắn tới: /app/chat/{offeringId}/sendMessage
    @MessageMapping("/chat/{offeringId}/sendMessage")
    public void sendMessage(@DestinationVariable String offeringId, @Payload MessageRequest request) {

        // 1. Lưu tin nhắn vào Database
        Message savedMessage = Message.builder()
                .messageId(UUID.randomUUID().toString())
                .courseOffering(offeringRepository.findById(offeringId).orElseThrow())
                .senderId(request.getSenderId())
                .content(request.getContent())
                .build();
        messageRepository.save(savedMessage);


        messagingTemplate.convertAndSend("/topic/course/" + offeringId, savedMessage);
    }

}