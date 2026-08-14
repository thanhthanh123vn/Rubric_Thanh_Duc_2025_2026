package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.MessageRequest;
import hcmuaf.edu.vn.fit.course_service.dto.request.TypingEvent;
import hcmuaf.edu.vn.fit.course_service.dto.response.MessageResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Message;
import hcmuaf.edu.vn.fit.course_service.mapper.MessageMapper;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.ConversationRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.mongo.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    public void sendMessage(
            @DestinationVariable String conversationId,
            @Payload MessageRequest request,
            Principal principal
    ) {
        try {

            if (principal == null) {
                throw new RuntimeException("LỖI NGHIÊM TRỌNG: Principal (Người dùng) đang bị null. Hãy kiểm tra lại WebSocketConfig.");
            }

            String realSenderId = principal.getName();


            conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng chat với ID: " + conversationId));

            boolean hasOffering = request.getOfferingId() != null &&
                    offeringRepository.existsById(request.getOfferingId());

            Message message = new Message();
            message.setConversationId(conversationId);
            message.setSenderId(realSenderId);
            message.setContent(request.getContent());

            if (hasOffering) {
                message.setOfferingId(request.getOfferingId());
            }

            Message savedMessage = messageRepository.save(message);
            MessageResponse messageResponse = messageMapper.toResponse(savedMessage);

            // 3. Gửi tin nhắn qua WebSockets
            messagingTemplate.convertAndSend("/topic/chat/" + conversationId, messageResponse);

        } catch (Exception e) {
            // ==========================================
            // IN RA TOÀN BỘ LỖI MÀU ĐỎ XUỐNG CONSOLE ĐỂ BẠN DỄ SỬA
            // ==========================================
            System.err.println("==== LỖI KHI GỬI TIN NHẮN WEBSOCKET ====");
            e.printStackTrace();
            throw e;
        }
    }

    // Cập nhật API lấy lịch sử: Thêm Pageable để ngăn tràn RAM
    @GetMapping("/chat/conversation/{conversationId}/history")
    public ResponseEntity<?> getChatHistory(
            @PathVariable String conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);

            // Dùng Slice thay vì List để lấy từng phần dữ liệu một cách tối ưu
            Slice<Message> messageSlice = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId, pageable);

            List<MessageResponse> history = messageMapper.toResponseList(messageSlice.getContent());

            // Đóng gói Response kèm theo cờ "hasNext" để báo cho Frontend biết còn tin nhắn cũ không
            Map<String, Object> response = new HashMap<>();
            response.put("messages", history);
            response.put("hasNext", messageSlice.hasNext());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi tải lịch sử chat: " + e.getMessage());
        }
    }

    @MessageMapping("/chat/{conversationId}/typing")
    public void handleTyping(@DestinationVariable String conversationId, @Payload TypingEvent event) {
        messagingTemplate.convertAndSend("/topic/chat/" + conversationId + "/typing", event);
    }
}