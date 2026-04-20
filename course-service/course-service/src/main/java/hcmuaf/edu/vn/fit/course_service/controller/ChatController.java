package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.MessageRequest;
import hcmuaf.edu.vn.fit.course_service.dto.request.TypingEvent;
import hcmuaf.edu.vn.fit.course_service.entity.Message;
import hcmuaf.edu.vn.fit.course_service.repository.MessageRepository;
import hcmuaf.edu.vn.fit.course_service.repository.CourseOfferingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.*;

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
        Map<String, Object> messageDto = new HashMap<>();
        messageDto.put("messageId", savedMessage.getMessageId());
        messageDto.put("senderId", savedMessage.getSenderId());
        messageDto.put("content", savedMessage.getContent());

        // 3. Gửi DTO (Map) thay vì gửi Entity
        messagingTemplate.convertAndSend("/topic/course/" + offeringId, Optional.of(messageDto));


    }
    @GetMapping("/api/v1/chat/{offeringId}/history")
    @ResponseBody
    public ResponseEntity<List<Message>> getChatHistory(@PathVariable String offeringId) {
        // Cần viết thêm hàm findByCourseOffering_OfferingIdOrderByCreatedAtAsc trong MessageRepository
        List<Message> history = messageRepository.findByCourseOffering_OfferingIdOrderByCreatedAtAsc(offeringId);
        return ResponseEntity.ok(history);
    }
    @MessageMapping("/chat/{offeringId}/typing")
    public void handleTyping(@DestinationVariable String offeringId, @Payload TypingEvent event) {

        messagingTemplate.convertAndSend("/topic/course/" + offeringId + "/typing", event);
    }


}