package hcmuaf.edu.vn.fit.course_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.CreateAttendanceSessionRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.AttendanceSessionResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.AttendanceSessionSummaryResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.AttendanceStudentResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Attendance;
import hcmuaf.edu.vn.fit.course_service.entity.AttendanceSession;
import hcmuaf.edu.vn.fit.course_service.entity.enums.AttendanceSessionStatus;
import hcmuaf.edu.vn.fit.course_service.entity.enums.AttendanceSessionType;
import hcmuaf.edu.vn.fit.course_service.exception.BadRequestException;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.AttendanceRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.AttendanceSessionRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseOfferingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceSessionService {

    private static final long SUSPICIOUS_CHECK_IN_WINDOW_SECONDS = 15
            ;

    private final AttendanceSessionRepository attendanceSessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final UserClient userClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public AttendanceSessionResponse createAttendanceSession(
            CreateAttendanceSessionRequest request,
            String currentUserId
    ) {
        validateRequest(request, currentUserId);
        closeExpiredSessionsByOffering(request.getOfferingId());
        findActiveSessionEntity(request.getOfferingId())
                .ifPresent(session -> {
                    throw new BadRequestException("Lop hoc phan dang co QR chua het han, khong the tao phien moi");
                });

        courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new BadRequestException("Khong tim thay lop hoc phan voi offeringId: " + request.getOfferingId()));

        String sessionId = generateSessionId();
        String qrToken = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");

        AttendanceSession session = AttendanceSession.builder()
                .sessionId(sessionId)
                .offeringId(request.getOfferingId().trim())
                .createdBy(currentUserId.trim())
                .attendanceDate(request.getAttendanceDate())
                .type(AttendanceSessionType.QR)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .radius(request.getRadius())
                .qrToken(qrToken)
                .status(AttendanceSessionStatus.OPEN)
                .build();

        AttendanceSession savedSession = attendanceSessionRepository.save(session);
        return toAttendanceSessionResponse(savedSession);
    }

    @Transactional
    public List<AttendanceSessionSummaryResponse> getSessionsByOffering(String offeringId) {
        if (offeringId == null || offeringId.trim().isEmpty()) {
            throw new BadRequestException("offeringId khong duoc de trong");
        }

        closeExpiredSessionsByOffering(offeringId);

        return attendanceSessionRepository.findByOfferingIdOrderByCreatedAtDesc(offeringId.trim())
                .stream()
                .map(session -> AttendanceSessionSummaryResponse.builder()
                        .sessionId(session.getSessionId())
                        .offeringId(session.getOfferingId())
                        .attendanceDate(session.getAttendanceDate())
                        .startTime(session.getStartTime())
                        .endTime(session.getEndTime())
                        .status(session.getStatus().name())
                        .checkedInCount(attendanceRepository.countBySessionId(session.getSessionId()))
                        .build())
                .toList();
    }

    @Transactional
    public AttendanceSessionResponse getActiveSession(String offeringId) {
        if (offeringId == null || offeringId.trim().isEmpty()) {
            throw new BadRequestException("offeringId khong duoc de trong");
        }

        closeExpiredSessionsByOffering(offeringId);

        AttendanceSession session = findActiveSessionEntity(offeringId)
                .orElseThrow(() -> new BadRequestException("Khong co QR nao dang con hieu luc"));

        return toAttendanceSessionResponse(session);
    }

    @Transactional(readOnly = true)
    public List<AttendanceStudentResponse> getAttendanceBySession(String sessionId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            throw new BadRequestException("sessionId khong duoc de trong");
        }

        AttendanceSession session = attendanceSessionRepository.findById(sessionId.trim())
                .orElseThrow(() -> new BadRequestException("Khong tim thay phien diem danh"));

        List<Attendance> attendances = attendanceRepository.findBySessionIdOrderByCheckinTimeAsc(sessionId.trim());
        Map<String, SuspiciousClusterInfo> suspiciousClusters = detectSuspiciousClusters(attendances);

        return attendances.stream()
                .map(attendance -> toAttendanceStudentResponse(attendance, session, suspiciousClusters.get(attendance.getAttendanceId())))
                .toList();
    }

    private void validateRequest(CreateAttendanceSessionRequest request, String currentUserId) {
        if (request == null) {
            throw new BadRequestException("Request tao phien diem danh khong duoc de trong");
        }
        if (request.getOfferingId() == null || request.getOfferingId().trim().isEmpty()) {
            throw new BadRequestException("offeringId khong duoc de trong");
        }
        if (currentUserId == null || currentUserId.trim().isEmpty()) {
            throw new BadRequestException("Khong xac dinh duoc giang vien dang dang nhap");
        }
        if (request.getAttendanceDate() == null) {
            throw new BadRequestException("attendanceDate khong duoc de trong");
        }
        if (request.getLatitude() == null || request.getLongitude() == null) {
            throw new BadRequestException("latitude va longitude khong duoc de trong");
        }
        if (request.getRadius() == null || request.getRadius() <= 0) {
            throw new BadRequestException("radius phai lon hon 0");
        }
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new BadRequestException("startTime va endTime khong duoc de trong");
        }
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new BadRequestException("startTime phai nho hon endTime");
        }

        LocalDate attendanceDate = request.getAttendanceDate();
        if (!request.getStartTime().toLocalDate().equals(attendanceDate)
                || !request.getEndTime().toLocalDate().equals(attendanceDate)) {
            throw new BadRequestException("attendanceDate phai trung voi ngay cua startTime va endTime");
        }

        if (request.getEndTime().isBefore(LocalDateTime.of(attendanceDate, request.getStartTime().toLocalTime()))) {
            throw new BadRequestException("Khoang thoi gian diem danh khong hop le");
        }
    }

    private String generateSessionId() {
        return "AS-" + UUID.randomUUID().toString().replace("-", "");
    }

    private String buildQrContent(String sessionId, String qrToken) {
        try {
            return objectMapper.writeValueAsString(Map.of(
                    "sessionId", sessionId,
                    "qrToken", qrToken
            ));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Khong the tao noi dung QR", exception);
        }
    }

    private AttendanceSessionResponse toAttendanceSessionResponse(AttendanceSession session) {
        return AttendanceSessionResponse.builder()
                .sessionId(session.getSessionId())
                .offeringId(session.getOfferingId())
                .qrToken(session.getQrToken())
                .qrContent(buildQrContent(session.getSessionId(), session.getQrToken()))
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .status(session.getStatus().name())
                .build();
    }

    private Optional<AttendanceSession> findActiveSessionEntity(String offeringId) {
        return attendanceSessionRepository
                .findFirstByOfferingIdAndStatusOrderByEndTimeDesc(offeringId.trim(), AttendanceSessionStatus.OPEN)
                .filter(session -> session.getEndTime() != null && session.getEndTime().isAfter(LocalDateTime.now()));
    }

    private void closeExpiredSessionsByOffering(String offeringId) {
        List<AttendanceSession> expiredSessions = attendanceSessionRepository.findByOfferingIdAndStatusAndEndTimeBefore(
                offeringId.trim(),
                AttendanceSessionStatus.OPEN,
                LocalDateTime.now()
        );

        if (expiredSessions.isEmpty()) {
            return;
        }

        expiredSessions.forEach(session -> session.setStatus(AttendanceSessionStatus.CLOSED));
        attendanceSessionRepository.saveAll(expiredSessions);
    }

    private AttendanceStudentResponse toAttendanceStudentResponse(
            Attendance attendance,
            AttendanceSession session,
            SuspiciousClusterInfo suspiciousClusterInfo
    ) {
        String studentName = attendance.getStudentId();
        String email = null;
        Double sessionRadius = session.getRadius();
        boolean missingGps = attendance.getLatitude() == null || attendance.getLongitude() == null || attendance.getDistance() == null;
        boolean outOfRadius = sessionRadius != null && attendance.getDistance() != null && attendance.getDistance() > sessionRadius;
        boolean suspicious = missingGps || outOfRadius || suspiciousClusterInfo != null;
        List<String> suspiciousReasons = new ArrayList<>();

        if (missingGps) {
            suspiciousReasons.add("Khong co du lieu GPS check-in");
        }
        if (outOfRadius) {
            suspiciousReasons.add("Vi tri check-in vuot qua ban kinh cho phep");
        }
        if (suspiciousClusterInfo != null) {
            suspiciousReasons.add(suspiciousClusterInfo.reason());
        }

        try {
            var student = userClient.getSinhVien(attendance.getStudentId());
            if (student != null) {
                if (student.getFullName() != null && !student.getFullName().isBlank()) {
                    studentName = student.getFullName();
                }
                email = student.getEmail();
            }
        } catch (Exception ignored) {
        }

        return AttendanceStudentResponse.builder()
                .attendanceId(attendance.getAttendanceId())
                .sessionId(attendance.getSessionId())
                .studentId(attendance.getStudentId())
                .studentName(studentName)
                .email(email)
                .status(attendance.getStatus().name())
                .method(attendance.getMethod() != null ? attendance.getMethod().name() : null)
                .checkinTime(attendance.getCheckinTime())
                .latitude(attendance.getLatitude())
                .longitude(attendance.getLongitude())
                .distance(attendance.getDistance())
                .sessionRadius(sessionRadius)
                .browserId(attendance.getBrowserId())
                .userAgent(attendance.getUserAgent())
                .ipAddress(attendance.getIpAddress())
                .suspicious(suspicious)
                .suspiciousReason(suspiciousReasons.isEmpty() ? null : String.join("; ", suspiciousReasons))
                .note(attendance.getNote())
                .build();
    }

    private Map<String, SuspiciousClusterInfo> detectSuspiciousClusters(List<Attendance> attendances) {
        Map<String, List<Attendance>> groupedAttendances = new HashMap<>();

        for (Attendance attendance : attendances) {
            String fingerprintKey = buildSuspiciousFingerprint(attendance);
            if (fingerprintKey == null) {
                continue;
            }
            groupedAttendances.computeIfAbsent(fingerprintKey, ignored -> new ArrayList<>()).add(attendance);
        }

        Map<String, SuspiciousClusterInfo> suspiciousClusters = new HashMap<>();
        for (List<Attendance> sameFingerprintAttendances : groupedAttendances.values()) {
            markSuspiciousAttendances(sameFingerprintAttendances, suspiciousClusters);
        }

        return suspiciousClusters;
    }

    private void markSuspiciousAttendances(
            List<Attendance> sameFingerprintAttendances,
            Map<String, SuspiciousClusterInfo> suspiciousClusters
    ) {
        if (sameFingerprintAttendances.size() < 2) {
            return;
        }

        List<String> distinctStudentIds = sameFingerprintAttendances.stream()
                .map(Attendance::getStudentId)
                .filter(studentId -> studentId != null && !studentId.isBlank())
                .distinct()
                .toList();

        if (distinctStudentIds.size() < 2) {
            return;
        }

        saveSuspiciousCluster(sameFingerprintAttendances, distinctStudentIds, suspiciousClusters);
    }

    private void saveSuspiciousCluster(
            List<Attendance> clusterAttendances,
            List<String> distinctStudentIds,
            Map<String, SuspiciousClusterInfo> suspiciousClusters
    ) {
        if (clusterAttendances.size() < 2) {
            return;
        }

        long minGapSeconds = calculateMinGapSeconds(clusterAttendances);
        boolean rapidCheckIn = minGapSeconds <= SUSPICIOUS_CHECK_IN_WINDOW_SECONDS;
        String timeMessage = rapidCheckIn
                ? "Cac tai khoan check-in lien tiep rat nhanh"
                : "Nhieu tai khoan dung chung thiet bi/mang trong cung phien";

        String reason = String.format(
                "Trung Browser ID, User-Agent va IP %s; %s; do lech nho nhat %d giay; tai khoan: %s; Browser ID: %s",
                safeValue(clusterAttendances.get(0).getIpAddress()),
                timeMessage,
                minGapSeconds,
                distinctStudentIds.stream().collect(Collectors.joining(", ")),
                safeValue(clusterAttendances.get(0).getBrowserId())
        );

        for (Attendance attendance : clusterAttendances) {
            suspiciousClusters.put(attendance.getAttendanceId(), new SuspiciousClusterInfo(reason));
        }
    }

    private String buildSuspiciousFingerprint(Attendance attendance) {
        if (attendance.getBrowserId() == null || attendance.getBrowserId().isBlank()) {
            return null;
        }
        if (attendance.getUserAgent() == null || attendance.getUserAgent().isBlank()) {
            return null;
        }
        if (attendance.getIpAddress() == null || attendance.getIpAddress().isBlank()) {
            return null;
        }

        return String.join("|", attendance.getBrowserId(), attendance.getUserAgent(), attendance.getIpAddress());
    }

    private long calculateMinGapSeconds(List<Attendance> attendances) {
        long minGapSeconds = Long.MAX_VALUE;

        for (int index = 1; index < attendances.size(); index++) {
            LocalDateTime previousTime = attendances.get(index - 1).getCheckinTime();
            LocalDateTime currentTime = attendances.get(index).getCheckinTime();
            long gapSeconds = secondsBetween(previousTime, currentTime);
            if (gapSeconds < minGapSeconds) {
                minGapSeconds = gapSeconds;
            }
        }

        return minGapSeconds == Long.MAX_VALUE ? Long.MAX_VALUE : minGapSeconds;
    }

    private long secondsBetween(LocalDateTime firstTime, LocalDateTime secondTime) {
        if (firstTime == null || secondTime == null) {
            return Long.MAX_VALUE;
        }

        return Math.abs(java.time.temporal.ChronoUnit.SECONDS.between(firstTime, secondTime));
    }

    private String safeValue(String value) {
        if (value == null || value.isBlank()) {
            return "--";
        }
        return value;
    }

    private record SuspiciousClusterInfo(String reason) {
    }
}
