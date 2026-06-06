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
            throw new BadRequestException("Khong xac dinh duoc sinh vien dang dang nhap");
        }
        if (request == null || request.getQrContent() == null || request.getQrContent().trim().isEmpty()) {
            throw new BadRequestException("qrContent khong duoc de trong");
        }
        if (request.getLatitude() == null || request.getLongitude() == null) {
            throw new BadRequestException("Can cap quyen GPS de diem danh");
        }

        Map<String, String> qrPayload = parseQrContent(request.getQrContent());
        String sessionId = requiredPayloadValue(qrPayload, "sessionId");
        String qrToken = requiredPayloadValue(qrPayload, "qrToken");

        AttendanceSession session = attendanceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new BadRequestException("Khong tim thay phien diem danh"));

        closeSessionIfExpired(session);

        if (session.getStatus() != AttendanceSessionStatus.OPEN) {
            throw new BadRequestException("Phien diem danh da dong");
        }
        if (!session.getQrToken().equals(qrToken)) {
            throw new BadRequestException("QR token khong hop le");
        }
        if (!enrollmentRepository.findByStudentIdAndCourseOffering_OfferingId(currentStudentId, session.getOfferingId()).isPresent()) {
            throw new BadRequestException("Sinh vien khong thuoc lop hoc phan nay");
        }
        if (attendanceRepository.existsBySessionIdAndStudentId(sessionId, currentStudentId)) {
            throw new BadRequestException("Sinh vien da diem danh cho phien nay");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(session.getStartTime())) {
            throw new BadRequestException("Phien diem danh chua bat dau");
        }
        if (now.isAfter(session.getEndTime())) {
            throw new BadRequestException("Phien diem danh da het han");
        }

        double distance = calculateDistanceMeters(
                session.getLatitude(),
                session.getLongitude(),
                request.getLatitude(),
                request.getLongitude()
        );
        if (session.getRadius() != null && distance > session.getRadius()) {
            throw new BadRequestException("Ban dang ngoai pham vi GPS cho phep");
        }

        Attendance attendance = Attendance.builder()
                .sessionId(session.getSessionId())
                .studentId(currentStudentId.trim())
                .offeringId(session.getOfferingId())
                .studyDate(session.getAttendanceDate())
                .status(AttendanceStatus.PRESENT)
                .checkinTime(now)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .distance(distance)
                .method(AttendanceMethod.QR)
                .note("Diem danh thanh cong bang QR + GPS")
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
                .message("Diem danh thanh cong")
                .build();
    }

    @Transactional(readOnly = true)
    public List<AttendanceHistoryResponse> getMyAttendanceHistory(String currentStudentId, String offeringId) {
        if (currentStudentId == null || currentStudentId.trim().isEmpty()) {
            throw new BadRequestException("Khong xac dinh duoc sinh vien dang dang nhap");
        }
        if (offeringId == null || offeringId.trim().isEmpty()) {
            throw new BadRequestException("offeringId khong duoc de trong");
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
            throw new BadRequestException("QR content khong dung dinh dang JSON hop le");
        }
    }

    private String requiredPayloadValue(Map<String, String> qrPayload, String key) {
        String value = qrPayload.get(key);
        if (value == null || value.trim().isEmpty()) {
            throw new BadRequestException("QR content thieu truong " + key);
        }
        return value.trim();
    }

    private double calculateDistanceMeters(
            Double lat1,
            Double lon1,
            Double lat2,
            Double lon2
    ) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            throw new BadRequestException("Thieu du lieu GPS de xac thuc diem danh");
        }

        double earthRadius = 6371000D;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }

    private void closeSessionIfExpired(AttendanceSession session) {
        if (session.getStatus() == AttendanceSessionStatus.OPEN
                && session.getEndTime() != null
                && !session.getEndTime().isAfter(LocalDateTime.now())) {
            session.setStatus(AttendanceSessionStatus.CLOSED);
            attendanceSessionRepository.save(session);
        }
    }
}
