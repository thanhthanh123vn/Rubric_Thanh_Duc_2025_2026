package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.request.MessageRequest;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.Message; // Entity này giờ là @Document MongoDB
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.EnrollmentRepository;
import hcmuaf.edu.vn.fit.course_service.repository.mongo.MessageRepository; // Đã đổi sang MongoRepository
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class MessageService {

    // Kho lưu trữ Mongo
    private final MessageRepository messageRepository;

    // Kho lưu trữ SQL
    private final CourseOfferingRepository offeringRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;

    /**
     * Xóa @Transactional: Vì chúng ta đang dùng 2 DB khác nhau (MySQL để đọc Offering, MongoDB để ghi Message).
     * @Transactional mặc định của Spring chỉ bao phủ MySQL, nên không còn tác dụng với Mongo.
     */
    public void createMessageText(MessageRequest request, String senderId) {
        // 1. Vẫn kiểm tra lớp học bên SQL để đảm bảo tính toàn vẹn dữ liệu
        CourseOffering offering = getValidOffering(request.getOfferingId());

        // 2. Lưu tin nhắn vào MongoDB
        Message message = Message.builder()
                // Chỉ lưu ID thay vì truyền nguyên Object SQL sang MongoDB
                .offeringId(offering.getOfferingId())
                .senderId(senderId)
                .content(request.getContent())
                // Không cần UUID.randomUUID(), Mongo sẽ tự tạo _id
                .build();

        Message savedMessage = messageRepository.save(message);

        // 3. Gửi qua WebSocket tới Kênh của Lớp học (Room)
        sendToWebSocket(savedMessage, offering.getOfferingId());
    }

    public void createMessageFile(String offeringId, MultipartFile file, String senderId) {
        CourseOffering offering = getValidOffering(offeringId);

        try {
            // Giả lập upload file
            // String mockFileUrl = "https://cloudinary.com/...";

            Message message = Message.builder()
                    // Gắn khóa ngoại dưới dạng String
                    .offeringId(offering.getOfferingId())
                    .senderId(senderId)
                    // .content("Đã gửi một tệp đính kèm: " + file.getOriginalFilename())
                    // .fileUrl(mockFileUrl)
                    .build();

            Message savedMessage = messageRepository.save(message);

            sendToWebSocket(savedMessage, offeringId);

        } catch (Exception e) {
            throw new RuntimeException("Lỗi upload file", e);
        }
    }

    private void sendToWebSocket(Message message, String offeringId) {
        simpMessagingTemplate.convertAndSend("/topic/course/" + offeringId, message);
    }

    private CourseOffering getValidOffering(String offeringId) {
        return offeringRepository.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Lớp học phần không tồn tại"));
    }
}