package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.request.MessageRequest; // Bạn cần tạo DTO này
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.Enrollment;
import hcmuaf.edu.vn.fit.course_service.entity.Message;
import hcmuaf.edu.vn.fit.course_service.repository.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.EnrollmentRepository;
import hcmuaf.edu.vn.fit.course_service.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.ObjectUtils;



import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final CourseOfferingRepository offeringRepository;
    private final EnrollmentRepository enrollmentRepository; // Dùng để lấy list sinh viên
    private final SimpMessagingTemplate simpMessagingTemplate;


    @Transactional
    public void createMessageText(MessageRequest request, String senderId) {
        CourseOffering offering = getValidOffering(request.getOfferingId());

        // 1. Lưu tin nhắn
        Message message = Message.builder()
                .messageId(UUID.randomUUID().toString())
                .courseOffering(offering)
                .senderId(senderId)
                .content(request.getContent())
                // .messageType("TEXT") // Thêm trường này vào Entity nếu cần
                .build();

        Message savedMessage = messageRepository.save(message);

        // 2. Gửi qua WebSocket tới Kênh của Lớp học (Room)
        sendToWebSocket(savedMessage, offering.getOfferingId());

        // 3. Tạo thông báo cho các thành viên trong lớp (Offline)
        // sendNotificationToClass(savedMessage, offering, senderId);
    }

    @Transactional
    public void createMessageFile(String offeringId, MultipartFile file, String senderId) {
        CourseOffering offering = getValidOffering(offeringId);

        try {
            // Logic Cloudinary (Giữ nguyên từ dự án cũ của bạn)
//            String fileName = file.getOriginalFilename() + "_" + UUID.randomUUID().toString();
//            // Map params = ObjectUtils.asMap("folder", "lms_messages", "public_id", fileName, "resource_type", "auto");
//            // Map result = cloudinary.uploader().upload(file.getBytes(), params);
//            String mockFileUrl = "https://cloudinary.com/..."; // Thay bằng result.get("url")

            Message message = Message.builder()
                    .messageId(UUID.randomUUID().toString())
                    .courseOffering(offering)
                    .senderId(senderId)
                    // .content("Đã gửi một tệp đính kèm: " + file.getOriginalFilename())
                    // .fileUrl(mockFileUrl)
                    // .messageType("FILE")
                    .build();

            Message savedMessage = messageRepository.save(message);

            sendToWebSocket(savedMessage, offeringId);
            // sendNotificationToClass(savedMessage, offering, senderId);

        } catch (Exception e) {
            throw new RuntimeException("Lỗi upload file", e);
        }
    }

    // --- CÁC HÀM HỖ TRỢ ---

    private void sendToWebSocket(Message message, String offeringId) {
        // Nên map Message sang MessageResponse DTO trước khi gửi để giấu các thông tin nhạy cảm
        simpMessagingTemplate.convertAndSend("/topic/course/" + offeringId, message);
    }

    private CourseOffering getValidOffering(String offeringId) {
        return offeringRepository.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Lớp học phần không tồn tại"));
    }

    /* // LUỒNG TẠO THÔNG BÁO CHO LỚP HỌC (Thay thế cho logic cũ)
    private void sendNotificationToClass(Message message, CourseOffering offering, String senderId) {
        // Lấy danh sách sinh viên
        List<String> participantIds = enrollmentRepository.findByCourseOffering(offering)
                .stream()
                .map(Enrollment::getStudentId)
                .collect(Collectors.toList());

        // Thêm giảng viên vào danh sách nhận
        participantIds.add(offering.getLecturerId());

        // Gửi thông báo cho mọi người (Trừ người vừa nhắn)
        for (String recipientId : participantIds) {
            if (!recipientId.equals(senderId)) {
                // Kiểm tra xem user có đang mở khung chat lớp này không (Dùng WebSocketEventListener)
                // Nếu không mở -> Gọi NotificationService tạo thông báo
            }
        }
    }
    */
}