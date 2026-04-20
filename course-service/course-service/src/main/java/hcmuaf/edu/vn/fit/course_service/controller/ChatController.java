package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.MessageRequest;
import hcmuaf.edu.vn.fit.course_service.dto.request.TypingEvent;
import hcmuaf.edu.vn.fit.course_service.dto.response.MessageResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Conversation;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.Message;
import hcmuaf.edu.vn.fit.course_service.mapper.MessageMapper;
import hcmuaf.edu.vn.fit.course_service.repository.ConversationRepository;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.*;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/v1/course-service")
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageRepository messageRepository;
    private final CourseOfferingRepository offeringRepository;
    private final MessageMapper messageMapper;
    private final ConversationRepository conversationRepository;
    @MessageMapping("/chat/{conversationId}/sendMessage")
    public void sendMessage(@DestinationVariable String conversationId, @Payload MessageRequest request) {

        // 1. Tìm phòng chat dưới Database
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng chat"));

        CourseOffering offering = offeringRepository.findById(request.getOfferingId()).orElse(null);
        Message message = new Message();
        message.setMessageId(UUID.randomUUID().toString());
        message.setConversation(conversation);
        message.setSenderId(request.getSenderId());
        message.setContent(request.getContent());
        message.setCourseOffering(offering);

        Message savedMessage = messageRepository.save(message);


        MessageResponse messageResponse = messageMapper.toResponse(savedMessage);

        messagingTemplate.convertAndSend("/topic/chat/" + conversationId, messageResponse);
    }
    @GetMapping("/chat/conversation/{conversationId}/history")
    public ResponseEntity<?> getChatHistory(@PathVariable String conversationId) {
        try {

            List<Message> messages = messageRepository.findByConversation_IdOrderByCreatedAtAsc(conversationId);


            List<MessageResponse> history = messageMapper.toResponseList(messages);


            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi tải lịch sử chat: " + e.getMessage());
        }
    }
    @MessageMapping("/chat/{conversationId}/typing")
    public void handleTyping(@DestinationVariable String conversationId, @Payload TypingEvent event) {

        messagingTemplate.convertAndSend("/topic/chat/" + conversationId + "/typing", event);

    }

}