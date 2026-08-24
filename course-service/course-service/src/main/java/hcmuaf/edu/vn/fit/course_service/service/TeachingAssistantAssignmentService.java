package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.TeachingAssistantAssignmentRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.LecturerInfo;
import hcmuaf.edu.vn.fit.course_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.TeachingAssistantAssignmentResponse;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseOfferingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class TeachingAssistantAssignmentService {
    private final CourseOfferingRepository offeringRepository;
    private final UserClient userClient;

    @Transactional(readOnly = true)
    public List<TeachingAssistantAssignmentResponse> getMyOfferings(String userId) {
        LecturerResponse current = requireLecturer(userId);
        return offeringRepository.findAll().stream()
                .filter(offering -> isOwnedBy(offering, current.getLecturerId()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TeachingAssistantAssignmentResponse updateAssistants(
            String offeringId,
            String userId,
            TeachingAssistantAssignmentRequest request
    ) {
        LecturerResponse current = requireLecturer(userId);
        CourseOffering offering = offeringRepository.findById(offeringId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học phần."));
        if (!isOwnedBy(offering, current.getLecturerId())) {
            throw new SecurityException("Chỉ giảng viên chính phụ trách lớp mới được quản lý trợ giảng.");
        }
        String mainLecturerId = current.getLecturerId();

        List<String> assistantIds = request == null || request.getAssistantLecturerIds() == null
                ? List.of()
                : new ArrayList<>(new LinkedHashSet<>(request.getAssistantLecturerIds()));
        for (String assistantId : assistantIds) {
            if (assistantId == null || assistantId.isBlank()) {
                throw new IllegalArgumentException("Mã giảng viên trợ giảng không hợp lệ.");
            }
            if (assistantId.equals(mainLecturerId)) {
                throw new IllegalArgumentException("Giảng viên chính không thể đồng thời là trợ giảng.");
            }
            LecturerResponse assistant = getLecturer(assistantId);
            if (!isLecturerRole(assistant.getRole())) {
                throw new IllegalArgumentException("Chỉ giảng viên có role TEACHER mới được chọn làm trợ giảng.");
            }
            String courseDepartment = offering.getCourse() == null ? null : offering.getCourse().getDepartment();
            if (courseDepartment != null && !courseDepartment.equalsIgnoreCase(assistant.getDepartment())) {
                throw new IllegalArgumentException("Trợ giảng " + assistant.getFullName()
                        + " không thuộc bộ môn " + courseDepartment + ".");
            }
        }

        offering.setMainLecturerId(mainLecturerId);
        offering.setLecturerId(mainLecturerId);
        offering.setTeachingAssistantIds(new ArrayList<>(assistantIds));
        List<String> allLecturers = new ArrayList<>();
        allLecturers.add(mainLecturerId);
        allLecturers.addAll(assistantIds);
        offering.setLecturerIds(allLecturers);
        return toResponse(offeringRepository.save(offering));
    }

    private LecturerResponse requireLecturer(String userId) {
        LecturerResponse lecturer = userClient.getLecturerByUserId(userId);
        if (lecturer == null || lecturer.getLecturerId() == null) {
            throw new SecurityException("Không tìm thấy hồ sơ giảng viên của tài khoản.");
        }
        return lecturer;
    }

    private LecturerResponse getLecturer(String lecturerId) {
        try {
            LecturerResponse lecturer = userClient.getLecturer(lecturerId);
            if (lecturer == null) {
                throw new IllegalArgumentException("Không tìm thấy giảng viên " + lecturerId + ".");
            }
            return lecturer;
        } catch (IllegalArgumentException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new IllegalArgumentException("Không tìm thấy giảng viên " + lecturerId + ".");
        }
    }

    private String resolveMainLecturerId(CourseOffering offering) {
        if (hasText(offering.getMainLecturerId())) return offering.getMainLecturerId();
        if (hasText(offering.getLecturerId())) return offering.getLecturerId();
        if (offering.getLecturerIds() != null && !offering.getLecturerIds().isEmpty()) {
            return offering.getLecturerIds().getFirst();
        }
        return null;
    }

    private boolean isOwnedBy(CourseOffering offering, String lecturerId) {
        if (hasText(offering.getMainLecturerId())) {
            return Objects.equals(offering.getMainLecturerId(), lecturerId);
        }
        if (hasText(offering.getLecturerId())) {
            return Objects.equals(offering.getLecturerId(), lecturerId);
        }
        // Dữ liệu cũ chỉ có bảng course_offering_lecturers, chưa có cột giảng viên chính.
        // Tài khoản có role MAIN_LECTURER được phép nhận lớp nếu đang nằm trong danh sách này.
        return offering.getLecturerIds() != null && offering.getLecturerIds().contains(lecturerId);
    }

    private TeachingAssistantAssignmentResponse toResponse(CourseOffering offering) {
        String mainId = resolveMainLecturerId(offering);
        List<String> assistantIds = offering.getTeachingAssistantIds() == null
                ? List.of()
                : offering.getTeachingAssistantIds();
        return TeachingAssistantAssignmentResponse.builder()
                .offeringId(offering.getOfferingId())
                .offeringName(offering.getOfferingName())
                .courseCode(offering.getCourse() == null ? null : offering.getCourse().getCourseCode())
                .courseName(offering.getCourse() == null ? null : offering.getCourse().getCourseName())
                .department(offering.getCourse() == null ? null : offering.getCourse().getDepartment())
                .semester(offering.getSemester())
                .academicYear(offering.getAcademicYear())
                .status(offering.getStatus())
                .mainLecturer(toLecturerInfo(mainId))
                .teachingAssistants(assistantIds.stream().map(this::toLecturerInfo).toList())
                .build();
    }

    private LecturerInfo toLecturerInfo(String lecturerId) {
        if (!hasText(lecturerId)) return null;
        LecturerResponse lecturer = getLecturer(lecturerId);
        return new LecturerInfo(lecturerId, lecturer.getFullName());
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private boolean isLecturerRole(String role) {
        return "TEACHER".equalsIgnoreCase(role) || "LECTURER".equalsIgnoreCase(role);
    }
}
