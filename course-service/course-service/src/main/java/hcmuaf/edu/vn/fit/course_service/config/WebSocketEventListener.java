package hcmuaf.edu.vn.fit.course_service.config;

import hcmuaf.edu.vn.fit.course_service.service.MessageStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final MessageStatusService messageStatusService;
    private final SimpMessageSendingOperations messagingTemplate;

    // Các Map quản lý bằng ID kiểu String thay vì Long
    private final Map<String, Set<String>> onlineUsers = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> courseSubscribers = new ConcurrentHashMap<>(); // Thay cho conversationSubscribers
    private final Map<String, String> sessionToUser = new ConcurrentHashMap<>();

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        String userId = getUserIdFromHeaders(headerAccessor);

        if (userId != null) {
            sessionToUser.put(sessionId, userId);
            onlineUsers.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(sessionId);

            log.info("USER ONLINE: ID={}, Session={}", userId, sessionId);

            // Bắn trạng thái Online (Tùy chọn: Dùng nếu bạn có giao diện hiển thị danh sách SV đang online)
            messagingTemplate.convertAndSend("/topic/user-status", new UserStatusDto(userId, "ONLINE"));
        } else {
            log.warn("Connection rejected: Could not determine UserId for session {}", sessionId);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        String userId = sessionToUser.remove(sessionId);

        if (userId != null) {
            Set<String> sessions = onlineUsers.get(userId);
            if (sessions != null) {
                sessions.remove(sessionId);
                if (sessions.isEmpty()) {
                    onlineUsers.remove(userId);
                    log.info("USER OFFLINE: ID={}", userId);
                    messagingTemplate.convertAndSend("/topic/user-status", new UserStatusDto(userId, "OFFLINE"));
                }
            }
            // Xóa user khỏi các phòng chat lớp học khi ngắt kết nối
            courseSubscribers.values().forEach(sub -> sub.remove(userId));
        }
    }

    @EventListener
    public void handleSubscribeEvent(SessionSubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = headerAccessor.getDestination();
        String sessionId = headerAccessor.getSessionId();
        String userId = sessionToUser.get(sessionId);

        // Kênh đổi từ /topic/conversation/ sang /topic/course/
        if (userId != null && destination != null && destination.startsWith("/topic/course/")) {
            String offeringId = destination.replace("/topic/course/", "");

            if (!offeringId.contains("/")) {
                courseSubscribers.computeIfAbsent(offeringId, k -> ConcurrentHashMap.newKeySet()).add(userId);
                log.info("User {} is viewing course chat {}", userId, offeringId);

                // User đang xem lớp học này -> Cập nhật thời gian đọc cuối cùng (thay cho việc đánh dấu từng tin nhắn là SEEN)
                messageStatusService.markCourseMessagesAsRead(offeringId, userId);
            }
        }
    }

    public void removeUserFromCourse(String offeringId, String userId) {
        Set<String> subscribers = courseSubscribers.get(offeringId);
        if (subscribers != null) {
            boolean removed = subscribers.remove(userId);
            if (removed) {
                log.info("User {} left course chat {}", userId, offeringId);
            }
            if (subscribers.isEmpty()) {
                courseSubscribers.remove(offeringId);
            }
        }
    }

    public boolean isUserOnline(String userId) {
        return onlineUsers.containsKey(userId);
    }

    public boolean isUserInCourse(String offeringId, String userId) {
        Set<String> subscribers = courseSubscribers.get(offeringId);
        return subscribers != null && subscribers.contains(userId);
    }

    private String getUserIdFromHeaders(StompHeaderAccessor headerAccessor) {
        List<String> userIdHeaders = headerAccessor.getNativeHeader("userId");
        if (userIdHeaders != null && !userIdHeaders.isEmpty()) {
            return userIdHeaders.get(0); // Trả về String trực tiếp
        }
        return null;
    }

    public String getUserIdBySessionId(String sessionId) {
        return sessionToUser.get(sessionId);
    }

    public Set<String> getOnlineUserIds() {
        return new HashSet<>(onlineUsers.keySet());
    }

    // DTO siêu nhỏ để hỗ trợ trả về trạng thái User
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class UserStatusDto {
        private String userId;
        private String status;
    }
}