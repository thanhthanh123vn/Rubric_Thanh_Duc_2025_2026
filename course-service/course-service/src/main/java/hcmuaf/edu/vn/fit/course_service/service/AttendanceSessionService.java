package hcmuaf.edu.vn.fit.course_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.CreateAttendanceSessionRequest;
import hcmuaf.edu.vn.fit.course_service.dto.request.UpsertAttendanceLegendRequest;
import hcmuaf.edu.vn.fit.course_service.dto.request.UpdateAttendanceOverviewCellRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.AttendanceLegendResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.AttendanceOverviewDateResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.AttendanceSessionResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.AttendanceSessionSummaryResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.AttendanceStudentOverviewResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.AttendanceStudentResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.SinhVienResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Attendance;
import hcmuaf.edu.vn.fit.course_service.entity.AttendanceLegend;
import hcmuaf.edu.vn.fit.course_service.entity.AttendanceSession;
import hcmuaf.edu.vn.fit.course_service.entity.enums.AttendanceStatus;
import hcmuaf.edu.vn.fit.course_service.entity.enums.AttendanceSessionStatus;
import hcmuaf.edu.vn.fit.course_service.entity.enums.AttendanceSessionType;
import hcmuaf.edu.vn.fit.course_service.exception.BadRequestException;
import hcmuaf.edu.vn.fit.course_service.repository.AttendanceRepository;
import hcmuaf.edu.vn.fit.course_service.repository.AttendanceLegendRepository;
import hcmuaf.edu.vn.fit.course_service.repository.AttendanceSessionRepository;
import hcmuaf.edu.vn.fit.course_service.repository.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.EnrollmentRepository;
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
    private static final double ATTENDANCE_PASS_THRESHOLD = 0.8;
    private static final String ATTENDANCE_CATEGORY_DEFAULT = "DEFAULT";
    private static final String ATTENDANCE_CATEGORY_FRAUD = "FRAUD";
    private static final String FRAUD_NOTE_PREFIX = "[[FRAUD]]";
    private static final String ATTENDANCE_META_PREFIX = "[[META]]";
    private static final String ATTENDANCE_META_SUFFIX = "[[/META]]";
    private static final String SYSTEM_QR_SUCCESS_NOTE = "Diem danh thanh cong bang QR + GPS";
    private static final String SYSTEM_FRAUD_ABSENT_NOTE = "Giang vien danh vang sau khi doi chieu GPS";
    private static final String SYSTEM_FRAUD_RESTORED_NOTE = "Giang vien khoi phuc co mat";

    private final AttendanceSessionRepository attendanceSessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final AttendanceLegendRepository attendanceLegendRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final EnrollmentRepository enrollmentRepository;
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
    public List<AttendanceStudentOverviewResponse> getAttendanceOverviewByOffering(String offeringId) {
        if (offeringId == null || offeringId.trim().isEmpty()) {
            throw new BadRequestException("offeringId khong duoc de trong");
        }

        List<AttendanceSession> sessions = attendanceSessionRepository.findByOfferingIdOrderByCreatedAtDesc(offeringId.trim())
                .stream()
                .filter(session -> session.getAttendanceDate() != null && !session.getAttendanceDate().isAfter(LocalDate.now()))
                .sorted((first, second) -> first.getAttendanceDate().compareTo(second.getAttendanceDate()))
                .toList();

        List<String> studentIds = enrollmentRepository.findStudentIdsByOfferingId(offeringId.trim());
        List<Attendance> attendances = attendanceRepository.findByOfferingId(offeringId.trim());

        Map<String, Map<String, Attendance>> attendanceByStudentAndSession = attendances.stream()
                .collect(Collectors.groupingBy(
                        Attendance::getStudentId,
                        Collectors.toMap(
                                Attendance::getSessionId,
                                attendance -> attendance,
                                (current, ignored) -> current
                        )
                ));

        return studentIds.stream()
                .map(studentId -> buildAttendanceOverviewRow(studentId, sessions, attendanceByStudentAndSession))
                .sorted((first, second) -> first.getStudentId().compareToIgnoreCase(second.getStudentId()))
                .toList();
    }

    @Transactional
    public AttendanceOverviewDateResponse updateAttendanceOverviewCell(
            String offeringId,
            UpdateAttendanceOverviewCellRequest request
    ) {
        if (offeringId == null || offeringId.trim().isEmpty()) {
            throw new BadRequestException("offeringId khong duoc de trong");
        }
        if (request == null) {
            throw new BadRequestException("Request cap nhat o diem danh khong duoc de trong");
        }
        if (request.getStudentId() == null || request.getStudentId().trim().isEmpty()) {
            throw new BadRequestException("studentId khong duoc de trong");
        }
        if (request.getSessionId() == null || request.getSessionId().trim().isEmpty()) {
            throw new BadRequestException("sessionId khong duoc de trong");
        }
        if (request.getStatus() == null || request.getStatus().trim().isEmpty()) {
            throw new BadRequestException("status khong duoc de trong");
        }

        String normalizedOfferingId = offeringId.trim();
        String normalizedStudentId = request.getStudentId().trim();
        String normalizedSessionId = request.getSessionId().trim();
        AttendanceStatus status = parseAttendanceStatus(request.getStatus());

        if (enrollmentRepository.findByStudentIdAndCourseOffering_OfferingId(normalizedStudentId, normalizedOfferingId).isEmpty()) {
            throw new BadRequestException("Sinh vien khong thuoc lop hoc phan nay");
        }

        AttendanceSession session = attendanceSessionRepository.findById(normalizedSessionId)
                .orElseThrow(() -> new BadRequestException("Khong tim thay phien diem danh"));

        if (!normalizedOfferingId.equals(session.getOfferingId())) {
            throw new BadRequestException("Phien diem danh khong thuoc lop hoc phan nay");
        }

        Attendance attendance = attendanceRepository.findBySessionIdAndStudentId(normalizedSessionId, normalizedStudentId)
                .orElseGet(() -> Attendance.builder()
                        .sessionId(normalizedSessionId)
                        .studentId(normalizedStudentId)
                        .offeringId(normalizedOfferingId)
                        .studyDate(session.getAttendanceDate())
                        .build());

        attendance.setStatus(status);
        attendance.setStudyDate(session.getAttendanceDate());

        String normalizedCategory = normalizeAttendanceCategory(request.getCategory());
        String normalizedNote = normalizeNote(request.getNote());
        String normalizedColorHex = normalizeColorHex(request.getColorHex());
        String normalizedLegendLabel = normalizeLegendLabel(request.getLegendLabel());
        attendance.setNote(buildStoredAttendanceNote(
                normalizedCategory,
                normalizedNote,
                normalizedColorHex,
                normalizedLegendLabel
        ));

        if (status == AttendanceStatus.PRESENT && attendance.getCheckinTime() == null) {
            attendance.setCheckinTime(LocalDateTime.now());
        }

        Attendance savedAttendance = attendanceRepository.save(attendance);
        return toAttendanceOverviewDateResponse(session, savedAttendance);
    }

    @Transactional(readOnly = true)
    public List<AttendanceLegendResponse> getAttendanceLegendsByOffering(String offeringId) {
        String normalizedOfferingId = normalizeOfferingId(offeringId);
        validateOfferingExists(normalizedOfferingId);

        return attendanceLegendRepository.findByOfferingIdOrderByCreatedAtAsc(normalizedOfferingId).stream()
                .map(this::toAttendanceLegendResponse)
                .toList();
    }

    @Transactional
    public AttendanceLegendResponse upsertAttendanceLegend(
            String offeringId,
            UpsertAttendanceLegendRequest request
    ) {
        String normalizedOfferingId = normalizeOfferingId(offeringId);
        validateOfferingExists(normalizedOfferingId);
        if (request == null) {
            throw new BadRequestException("Request chu thich khong duoc de trong");
        }

        String normalizedLegendLabel = normalizeLegendLabel(request.getLegendLabel());
        String normalizedColorHex = normalizeColorHex(request.getColorHex());
        if (normalizedLegendLabel == null) {
            throw new BadRequestException("legendLabel khong duoc de trong");
        }
        if (normalizedColorHex == null) {
            throw new BadRequestException("colorHex khong hop le");
        }

        AttendanceLegend legend;
        if (request.getLegendId() != null && !request.getLegendId().trim().isEmpty()) {
            legend = attendanceLegendRepository.findById(request.getLegendId().trim())
                    .orElseThrow(() -> new BadRequestException("Khong tim thay chu thich"));
            if (!normalizedOfferingId.equals(legend.getOfferingId())) {
                throw new BadRequestException("Chu thich khong thuoc lop hoc phan nay");
            }
        } else {
            legend = AttendanceLegend.builder()
                    .offeringId(normalizedOfferingId)
                    .build();
        }

        legend.setLegendLabel(normalizedLegendLabel);
        legend.setColorHex(normalizedColorHex);

        AttendanceLegend savedLegend = attendanceLegendRepository.save(legend);
        return toAttendanceLegendResponse(savedLegend);
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

    @Transactional
    public AttendanceStudentResponse updateAttendanceStatus(
            String sessionId,
            String attendanceId,
            AttendanceStatus status
    ) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            throw new BadRequestException("sessionId khong duoc de trong");
        }
        if (attendanceId == null || attendanceId.trim().isEmpty()) {
            throw new BadRequestException("attendanceId khong duoc de trong");
        }
        if (status == null) {
            throw new BadRequestException("status khong duoc de trong");
        }

        AttendanceSession session = attendanceSessionRepository.findById(sessionId.trim())
                .orElseThrow(() -> new BadRequestException("Khong tim thay phien diem danh"));
        Attendance attendance = attendanceRepository.findById(attendanceId.trim())
                .orElseThrow(() -> new BadRequestException("Khong tim thay ban ghi diem danh"));

        if (!session.getSessionId().equals(attendance.getSessionId())) {
            throw new BadRequestException("Ban ghi diem danh khong thuoc phien nay");
        }

        attendance.setStatus(status);
        if (status == AttendanceStatus.ABSENT) {
            attendance.setNote(buildStoredAttendanceNote(ATTENDANCE_CATEGORY_FRAUD, null, null, null));
        } else if (hasFraudCategory(attendance.getNote())) {
            attendance.setNote(null);
        }

        Attendance savedAttendance = attendanceRepository.save(attendance);
        Map<String, SuspiciousClusterInfo> suspiciousClusters = detectSuspiciousClusters(
                attendanceRepository.findBySessionIdOrderByCheckinTimeAsc(sessionId.trim())
        );
        return toAttendanceStudentResponse(savedAttendance, session, suspiciousClusters.get(savedAttendance.getAttendanceId()));
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

    private AttendanceStudentOverviewResponse buildAttendanceOverviewRow(
            String studentId,
            List<AttendanceSession> sessions,
            Map<String, Map<String, Attendance>> attendanceByStudentAndSession
    ) {
        String studentName = studentId;
        String email = null;

        try {
            SinhVienResponse student = userClient.getSinhVien(studentId);
            if (student != null) {
                if (student.getFullName() != null && !student.getFullName().isBlank()) {
                    studentName = student.getFullName();
                }
                email = student.getEmail();
            }
        } catch (Exception ignored) {
        }

        Map<String, Attendance> attendanceBySession = attendanceByStudentAndSession.getOrDefault(studentId, Map.of());
        List<AttendanceOverviewDateResponse> attendanceDates = sessions.stream()
                .map(session -> {
                    Attendance attendance = attendanceBySession.get(session.getSessionId());
                    return toAttendanceOverviewDateResponse(session, attendance);
                })
                .toList();

        int totalSessions = attendanceDates.size();
        int presentCount = (int) attendanceDates.stream()
                .filter(item -> AttendanceStatus.PRESENT.name().equals(item.getStatus()))
                .count();
        int absentCount = totalSessions - presentCount;
        double presentRate = totalSessions == 0 ? 1 : (double) presentCount / totalSessions;

        return AttendanceStudentOverviewResponse.builder()
                .studentId(studentId)
                .studentName(studentName)
                .email(email)
                .totalSessions(totalSessions)
                .presentCount(presentCount)
                .absentCount(absentCount)
                .resultStatus(presentRate >= ATTENDANCE_PASS_THRESHOLD ? "PASS" : "FAIL")
                .attendanceDates(attendanceDates)
                .build();
    }

    private AttendanceOverviewDateResponse toAttendanceOverviewDateResponse(
            AttendanceSession session,
            Attendance attendance
    ) {
        AttendanceStatus status = attendance != null && attendance.getStatus() == AttendanceStatus.PRESENT
                ? AttendanceStatus.PRESENT
                : AttendanceStatus.ABSENT;
        String storedNote = attendance != null ? attendance.getNote() : null;
        String category = extractAttendanceCategory(storedNote);
        String note = extractAttendanceDisplayNote(storedNote);
        AttendanceLegendMetadata metadata = extractAttendanceLegendMetadata(storedNote);

        return AttendanceOverviewDateResponse.builder()
                .sessionId(session.getSessionId())
                .attendanceId(attendance != null ? attendance.getAttendanceId() : null)
                .attendanceDate(session.getAttendanceDate())
                .status(status.name())
                .category(category)
                .displayText(buildAttendanceDisplayText(status, note))
                .note(note)
                .colorHex(metadata != null ? metadata.colorHex() : null)
                .legendLabel(metadata != null ? metadata.legendLabel() : null)
                .build();
    }

    private AttendanceLegendResponse toAttendanceLegendResponse(AttendanceLegend legend) {
        return AttendanceLegendResponse.builder()
                .legendId(legend.getId())
                .offeringId(legend.getOfferingId())
                .legendLabel(legend.getLegendLabel())
                .colorHex(legend.getColorHex())
                .build();
    }

    private String buildAttendanceDisplayText(AttendanceStatus status, String note) {
        if (note != null && !note.isBlank()) {
            return note;
        }
        return "";
    }

    private AttendanceStatus parseAttendanceStatus(String value) {
        try {
            return AttendanceStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException("status khong hop le");
        }
    }

    private String normalizeNote(String note) {
        if (note == null) {
            return null;
        }

        String trimmed = note.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeOfferingId(String offeringId) {
        if (offeringId == null || offeringId.trim().isEmpty()) {
            throw new BadRequestException("offeringId khong duoc de trong");
        }
        return offeringId.trim();
    }

    private void validateOfferingExists(String offeringId) {
        courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new BadRequestException("Khong tim thay lop hoc phan voi offeringId: " + offeringId));
    }

    private String normalizeAttendanceCategory(String category) {
        if (category == null || category.trim().isEmpty()) {
            return ATTENDANCE_CATEGORY_DEFAULT;
        }

        String normalized = category.trim().toUpperCase();
        return ATTENDANCE_CATEGORY_FRAUD.equals(normalized)
                ? ATTENDANCE_CATEGORY_FRAUD
                : ATTENDANCE_CATEGORY_DEFAULT;
    }

    private String normalizeColorHex(String colorHex) {
        if (colorHex == null || colorHex.trim().isEmpty()) {
            return null;
        }

        String trimmed = colorHex.trim();
        return trimmed.matches("^#[0-9a-fA-F]{6}$") ? trimmed.toUpperCase() : null;
    }

    private String normalizeLegendLabel(String legendLabel) {
        return normalizeNote(legendLabel);
    }

    private String buildStoredAttendanceNote(String category, String note, String colorHex, String legendLabel) {
        String normalizedNote = normalizeNote(note);
        AttendanceLegendMetadata metadata = buildAttendanceLegendMetadata(colorHex, legendLabel);

        StringBuilder storedNote = new StringBuilder();
        if (ATTENDANCE_CATEGORY_FRAUD.equals(category)) {
            storedNote.append(FRAUD_NOTE_PREFIX);
        }
        if (metadata != null) {
            storedNote.append(ATTENDANCE_META_PREFIX)
                    .append(writeAttendanceLegendMetadata(metadata))
                    .append(ATTENDANCE_META_SUFFIX);
        }
        if (normalizedNote != null) {
            storedNote.append(normalizedNote);
        }

        return storedNote.isEmpty() ? null : storedNote.toString();
    }

    private boolean hasFraudCategory(String storedNote) {
        return storedNote != null
                && (storedNote.startsWith(FRAUD_NOTE_PREFIX) || SYSTEM_FRAUD_ABSENT_NOTE.equals(storedNote));
    }

    private String extractAttendanceCategory(String storedNote) {
        return hasFraudCategory(storedNote) ? ATTENDANCE_CATEGORY_FRAUD : ATTENDANCE_CATEGORY_DEFAULT;
    }

    private String extractAttendanceDisplayNote(String storedNote) {
        if (storedNote == null || storedNote.isBlank()) {
            return null;
        }

        if (SYSTEM_QR_SUCCESS_NOTE.equals(storedNote)
                || SYSTEM_FRAUD_ABSENT_NOTE.equals(storedNote)
                || SYSTEM_FRAUD_RESTORED_NOTE.equals(storedNote)) {
            return null;
        }

        if (!hasFraudCategory(storedNote)) {
            return extractNoteContent(storedNote);
        }

        return extractNoteContent(storedNote.substring(FRAUD_NOTE_PREFIX.length()));
    }

    private AttendanceLegendMetadata buildAttendanceLegendMetadata(String colorHex, String legendLabel) {
        String normalizedColorHex = normalizeColorHex(colorHex);
        String normalizedLegendLabel = normalizeLegendLabel(legendLabel);
        if (normalizedColorHex == null && normalizedLegendLabel == null) {
            return null;
        }
        return new AttendanceLegendMetadata(normalizedColorHex, normalizedLegendLabel);
    }

    private String writeAttendanceLegendMetadata(AttendanceLegendMetadata metadata) {
        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception exception) {
            throw new BadRequestException("Khong the luu chu thich mau");
        }
    }

    private AttendanceLegendMetadata extractAttendanceLegendMetadata(String storedNote) {
        String noteBody = removeFraudPrefix(storedNote);
        if (noteBody == null || !noteBody.startsWith(ATTENDANCE_META_PREFIX)) {
            return null;
        }

        int metaEndIndex = noteBody.indexOf(ATTENDANCE_META_SUFFIX);
        if (metaEndIndex < 0) {
            return null;
        }

        String json = noteBody.substring(ATTENDANCE_META_PREFIX.length(), metaEndIndex);
        try {
            AttendanceLegendMetadata metadata = objectMapper.readValue(json, AttendanceLegendMetadata.class);
            return buildAttendanceLegendMetadata(metadata.colorHex(), metadata.legendLabel());
        } catch (Exception exception) {
            return null;
        }
    }

    private String extractNoteContent(String storedNote) {
        String noteBody = removeFraudPrefix(storedNote);
        if (noteBody == null || noteBody.isBlank()) {
            return null;
        }

        if (!noteBody.startsWith(ATTENDANCE_META_PREFIX)) {
            return normalizeNote(noteBody);
        }

        int metaEndIndex = noteBody.indexOf(ATTENDANCE_META_SUFFIX);
        if (metaEndIndex < 0) {
            return normalizeNote(noteBody);
        }

        return normalizeNote(noteBody.substring(metaEndIndex + ATTENDANCE_META_SUFFIX.length()));
    }

    private String removeFraudPrefix(String storedNote) {
        if (storedNote == null) {
            return null;
        }

        if (storedNote.startsWith(FRAUD_NOTE_PREFIX)) {
            return storedNote.substring(FRAUD_NOTE_PREFIX.length());
        }

        return storedNote;
    }

    private record AttendanceLegendMetadata(String colorHex, String legendLabel) {
    }

    private record SuspiciousClusterInfo(String reason) {
    }
}
