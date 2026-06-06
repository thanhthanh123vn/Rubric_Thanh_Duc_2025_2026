package hcmuaf.edu.vn.fit.course_service.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import hcmuaf.edu.vn.fit.course_service.dto.request.StudentAttendanceCheckInRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.AttendanceCheckInResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.AttendanceHistoryResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Attendance;
import hcmuaf.edu.vn.fit.course_service.entity.AttendanceSession;
import hcmuaf.edu.vn.fit.course_service.entity.enums.AttendanceMethod;
import hcmuaf.edu.vn.fit.course_service.entity.enums.AttendanceSessionStatus;
import hcmuaf.edu.vn.fit.course_service.entity.enums.AttendanceStatus;
import hcmuaf.edu.vn.fit.course_service.exception.BadRequestException;
import hcmuaf.edu.vn.fit.course_service.repository.AttendanceRepository;
import hcmuaf.edu.vn.fit.course_service.repository.AttendanceSessionRepository;
import hcmuaf.edu.vn.fit.course_service.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudentAttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final AttendanceSessionRepository attendanceSessionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public AttendanceCheckInResponse checkIn(String currentStudentId, StudentAttendanceCheckInRequest request) {
        if (currentStudentId == null || currentStudentId.trim().isEmpty()) {
            throw new BadRequestException("Không xác định được sinh viên đang đăng nhập");
        }
        if (request == null || request.getQrContent() == null || request.getQrContent().trim().isEmpty()) {
            throw new BadRequestException("qrContent không được để trống");
        }

        Map<String, String> qrPayload = parseQrContent(request.getQrContent());
        String sessionId = requiredPayloadValue(qrPayload, "sessionId");
        String qrToken = requiredPayloadValue(qrPayload, "qrToken");

        AttendanceSession session = attendanceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy phiên điểm danh"));

        if (session.getStatus() != AttendanceSessionStatus.OPEN) {
            throw new BadRequestException("Phiên điểm danh đã đóng");
        }
        if (!session.getQrToken().equals(qrToken)) {
            throw new BadRequestException("QR token không hợp lệ");
        }
        if (!enrollmentRepository.findByStudentIdAndCourseOffering_OfferingId(currentStudentId, session.getOfferingId()).isPresent()) {
            throw new BadRequestException("Sinh viên không thuộc lớp học phần này");
        }
        if (attendanceRepository.existsBySessionIdAndStudentId(sessionId, currentStudentId)) {
            throw new BadRequestException("Sinh viên đã điểm danh cho phiên này");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(session.getStartTime())) {
            throw new BadRequestException("Phiên điểm danh chưa bắt đầu");
        }
        if (now.isAfter(session.getEndTime())) {
            throw new BadRequestException("Phiên điểm danh đã hết hạn");
        }

        Attendance attendance = Attendance.builder()
                .sessionId(session.getSessionId())
                .studentId(currentStudentId.trim())
                .offeringId(session.getOfferingId())
                .studyDate(session.getAttendanceDate())
                .status(AttendanceStatus.PRESENT)
                .checkinTime(now)
                .method(AttendanceMethod.QR)
                .note("Điểm danh thành công bằng QR")
                .build();

        Attendance savedAttendance = attendanceRepository.save(attendance);

        return AttendanceCheckInResponse.builder()
                .attendanceId(savedAttendance.getAttendanceId())
                .sessionId(savedAttendance.getSessionId())
                .offeringId(savedAttendance.getOfferingId())
                .studentId(savedAttendance.getStudentId())
                .status(savedAttendance.getStatus().name())
                .method(savedAttendance.getMethod().name())
                .studyDate(savedAttendance.getStudyDate())
                .checkinTime(savedAttendance.getCheckinTime())
                .note(savedAttendance.getNote())
                .message("Điểm danh thành công")
                .build();
    }

    @Transactional(readOnly = true)
    public List<AttendanceHistoryResponse> getMyAttendanceHistory(String currentStudentId, String offeringId) {
        if (currentStudentId == null || currentStudentId.trim().isEmpty()) {
            throw new BadRequestException("Không xác định được sinh viên đang đăng nhập");
        }
        if (offeringId == null || offeringId.trim().isEmpty()) {
            throw new BadRequestException("offeringId không được để trống");
        }

        return attendanceRepository.findByStudentIdAndOfferingIdOrderByCheckinTimeDesc(currentStudentId, offeringId)
                .stream()
                .map(attendance -> AttendanceHistoryResponse.builder()
                        .attendanceId(attendance.getAttendanceId())
                        .sessionId(attendance.getSessionId())
                        .studyDate(attendance.getStudyDate())
                        .status(attendance.getStatus().name())
                        .method(attendance.getMethod() != null ? attendance.getMethod().name() : null)
                        .checkinTime(attendance.getCheckinTime())
                        .note(attendance.getNote())
                        .build())
                .toList();
    }

    private Map<String, String> parseQrContent(String qrContent) {
        try {
            return objectMapper.readValue(qrContent, new TypeReference<>() {});
        } catch (Exception exception) {
            throw new BadRequestException("QR content không đúng định dạng JSON hợp lệ");
        }
    }

    private String requiredPayloadValue(Map<String, String> qrPayload, String key) {
        String value = qrPayload.get(key);
        if (value == null || value.trim().isEmpty()) {
            throw new BadRequestException("QR content thiếu trường " + key);
        }
        return value.trim();
    }
}
