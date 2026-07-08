package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.repository.jpa.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;


@Service
@RequiredArgsConstructor
public class MessageStatusService {

    private final EnrollmentRepository enrollmentRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;

    /**
     * Hàm này được gọi (qua REST API hoặc WebSocket) khi Sinh viên
     * mở trang chi tiết Khóa học hoặc bấm vào khung Chat của lớp.
     */
    @Transactional
    public void markCourseMessagesAsRead(String offeringId, String studentId) {

        // 1. Cập nhật thời gian đọc cuối cùng của sinh viên đối với lớp học này
        enrollmentRepository.findByStudentIdAndCourseOffering_OfferingId(studentId, offeringId)
                .ifPresent(enrollment -> {
                    // Cập nhật timestamp
                    enrollment.setLastReadTime(new Timestamp(System.currentTimeMillis()).toLocalDateTime());
                    enrollmentRepository.save(enrollment);
                });

        // 2. Tùy chọn: Gửi tín hiệu WebSocket về lại riêng cho sinh viên đó
        // để Frontend (React) tự động ẩn dấu chấm đỏ (badge) tin nhắn mới.
        // Chú ý dùng convertAndSendToUser để chỉ gửi cho đúng thiết bị của sinh viên này.
        simpMessagingTemplate.convertAndSendToUser(
                studentId,
                "/queue/course/" + offeringId + "/status",
                new MessageStatusUpdate(offeringId, "ALL_READ")
        );


    }

    // DTO thông báo trạng thái
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class MessageStatusUpdate {
        private String offeringId;
        private String status;
    }
}