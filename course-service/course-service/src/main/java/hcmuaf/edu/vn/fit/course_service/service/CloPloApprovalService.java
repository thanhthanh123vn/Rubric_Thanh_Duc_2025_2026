package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.CloPloMappingRequest;
import hcmuaf.edu.vn.fit.course_service.dto.request.CloPloReviewRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.CloPloSubmissionResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.UserResponse;
import hcmuaf.edu.vn.fit.course_service.entity.*;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CloPloApprovalService {
    private final CourseRepository courseRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final CourseCLORepository cloRepository;
    private final ProgramPloRepository ploRepository;
    private final EducationProgramRepository programRepository;
    private final CloPloMappingRepository mappingRepository;
    private final CloPloSubmissionRepository submissionRepository;
    private final UserClient userClient;

    @Transactional(readOnly = true)
    public CloPloSubmissionResponse getCourseProfile(String courseId, String userId, String role) {
        Course course = requireCourse(courseId);
        if ("DEAN".equals(role)) requireDeanScope(course, userId);
        else if (isDepartmentLeadership(role)) requireDepartmentScope(course, userId);
        else if ("MAIN_LECTURER".equals(role)) requireMainLecturerScope(course, userId);
        else throw new SecurityException("Bạn không có quyền xem hồ sơ CLO - PLO.");
        return toResponse(course, null);
    }

    @Transactional
    public CloPloSubmissionResponse saveDraft(String courseId, String userId, CloPloMappingRequest request) {
        Course course = requireCourse(courseId);
        requireMainLecturerScope(course, userId);
        List<CourseCLO> clos = clos(courseId);
        if (clos.isEmpty()) throw new IllegalStateException("Học phần phải có ít nhất một CLO.");

        CloPloSubmission submission = submissionRepository
                .findByCourseIdAndSubmissionType(courseId, CloPloSubmissionType.CLO_PLO_MAPPING)
                .orElseGet(() -> CloPloSubmission.builder()
                        .submissionId("CPS-" + UUID.randomUUID())
                        .courseId(courseId)
                        .submissionType(CloPloSubmissionType.CLO_PLO_MAPPING)
                        .status(CloPloApprovalStatus.DRAFT)
                        .build());
        requireMappingDraftable(submission);

        Map<String, CourseCLO> closById = clos.stream()
                .collect(Collectors.toMap(CourseCLO::getCloId, Function.identity()));
        Set<String> allowedPloIds = programPlos(course).stream()
                .map(ProgramPlo::getPloId).collect(Collectors.toSet());
        Map<String, Set<String>> requested = request == null || request.getMappings() == null
                ? Map.of() : request.getMappings();

        for (Map.Entry<String, Set<String>> entry : requested.entrySet()) {
            if (!closById.containsKey(entry.getKey())) {
                throw new IllegalArgumentException("CLO không thuộc học phần đang chỉnh sửa.");
            }
            if (entry.getValue() != null && !allowedPloIds.containsAll(entry.getValue())) {
                throw new IllegalArgumentException("PLO không thuộc chương trình đào tạo của học phần.");
            }
        }

        Set<String> cloIds = closById.keySet();
        mappingRepository.deleteByIdCloIdIn(cloIds);
        List<CloPloMapping> mappings = requested.entrySet().stream()
                .flatMap(entry -> Optional.ofNullable(entry.getValue()).orElseGet(Set::of).stream()
                        .map(ploId -> CloPloMapping.builder()
                                .id(new CloPloMappingId(entry.getKey(), ploId)).build()))
                .toList();
        mappingRepository.saveAll(mappings);

        submission.setStatus(CloPloApprovalStatus.DRAFT);
        submission.setRejectionReason(null);
        submission.setReviewedAt(null);
        submission.setReviewedBy(null);
        submission.setReviewedByName(null);
        submissionRepository.save(submission);
        return toResponse(course, submission);
    }

    @Transactional
    public CloPloSubmissionResponse submitClo(String cloId, String userId) {
        CourseCLO clo = cloRepository.findById(cloId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy CLO."));
        Course course = clo.getCourse();
        requireMainLecturerScope(course, userId);
        if (clo.getApprovalStatus() == CloPloApprovalStatus.PENDING_REVIEW
                || clo.getApprovalStatus() == CloPloApprovalStatus.APPROVED) {
            throw new IllegalStateException("CLO đang chờ duyệt hoặc đã được duyệt.");
        }
        UserResponse submitter = userClient.getUser(userId);
        clo.setApprovalStatus(CloPloApprovalStatus.PENDING_REVIEW);
        clo.setSubmittedBy(userId);
        clo.setSubmittedByName(submitter == null ? userId : submitter.getFullName());
        clo.setSubmittedAt(LocalDateTime.now());
        clo.setReviewedBy(null);
        clo.setReviewedByName(null);
        clo.setReviewedAt(null);
        clo.setRejectionReason(null);
        cloRepository.save(clo);
        return toResponse(course, null, clo);
    }

    @Transactional
    public CloPloSubmissionResponse submitMapping(String courseId, String userId) {
        Course course = requireCourse(courseId);
        requireMainLecturerScope(course, userId);
        List<CourseCLO> clos = clos(courseId);
        List<CloPloMapping> courseMappings = mappingRepository
                .findByIdCloIdIn(clos.stream().map(CourseCLO::getCloId).toList());
        if (courseMappings.isEmpty()) {
            throw new IllegalStateException("Không thể gửi duyệt mapping. Học phần chưa có ánh xạ CLO - PLO.");
        }
        Set<String> mappedCloIds = courseMappings.stream().map(item -> item.getId().getCloId()).collect(Collectors.toSet());
        List<String> unapproved = clos.stream()
                .filter(clo -> mappedCloIds.contains(clo.getCloId()))
                .filter(clo -> clo.getApprovalStatus() != CloPloApprovalStatus.APPROVED)
                .map(CourseCLO::getCloCode).toList();
        if (!unapproved.isEmpty()) {
            throw new IllegalStateException("Chỉ được gửi mapping của CLO đã duyệt. Chưa hợp lệ: "
                    + String.join(", ", unapproved));
        }
        CloPloSubmission submission = submissionRepository
                .findByCourseIdAndSubmissionType(courseId, CloPloSubmissionType.CLO_PLO_MAPPING)
                .orElseGet(() -> CloPloSubmission.builder()
                        .submissionId("CPS-" + UUID.randomUUID())
                        .courseId(courseId)
                        .submissionType(CloPloSubmissionType.CLO_PLO_MAPPING)
                        .status(CloPloApprovalStatus.DRAFT)
                        .build());
        requireEditable(submission);
        submit(submission, userId);
        return toResponse(course, submission);
    }

    private void submit(CloPloSubmission submission, String userId) {
        UserResponse submitter = userClient.getUser(userId);
        submission.setStatus(CloPloApprovalStatus.PENDING_REVIEW);
        submission.setRevisionNumber(Optional.ofNullable(submission.getRevisionNumber()).orElse(0) + 1);
        submission.setSubmittedBy(userId);
        submission.setSubmittedByName(submitter == null ? userId : submitter.getFullName());
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setReviewedAt(null);
        submission.setReviewedBy(null);
        submission.setReviewedByName(null);
        submission.setRejectionReason(null);
        submissionRepository.save(submission);
    }

    @Transactional(readOnly = true)
    public List<CloPloSubmissionResponse> getForApproval(String status, String reviewerId) {
        CloPloApprovalStatus parsed = parseStatus(status);
        List<String> courseIds = deanCourseIds(reviewerId);
        if (courseIds.isEmpty()) return List.of();
        Map<String, Course> courses = courseRepository.findAllById(courseIds).stream()
                .collect(Collectors.toMap(Course::getCourseId, Function.identity()));
        List<CloPloSubmissionResponse> mappingItems = submissionRepository
                .findByStatusAndCourseIdInOrderBySubmittedAtDesc(parsed, courseIds).stream()
                .filter(item -> item.getSubmissionType() == CloPloSubmissionType.CLO_PLO_MAPPING)
                .filter(item -> courses.containsKey(item.getCourseId()))
                .map(item -> toResponse(courses.get(item.getCourseId()), item))
                .toList();
        List<CloPloSubmissionResponse> cloItems = cloRepository
                .findByApprovalStatusAndCourseCourseIdInOrderBySubmittedAtDesc(parsed, courseIds).stream()
                .map(clo -> toResponse(clo.getCourse(), null, clo))
                .toList();
        return java.util.stream.Stream.concat(cloItems.stream(), mappingItems.stream())
                .sorted(Comparator.comparing(CloPloSubmissionResponse::getSubmittedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    @Transactional
    public CloPloSubmissionResponse review(String submissionId, String reviewerId, CloPloReviewRequest request) {
        if (submissionId.startsWith("CLO:")) {
            return reviewClo(submissionId.substring(4), reviewerId, request);
        }
        CloPloSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ CLO - PLO."));
        if (submission.getStatus() != CloPloApprovalStatus.PENDING_REVIEW) {
            throw new IllegalStateException("Chỉ có thể xử lý hồ sơ đang chờ duyệt.");
        }
        Course course = requireCourse(submission.getCourseId());
        requireDeanScope(course, reviewerId);
        String action = request == null ? "" : Optional.ofNullable(request.getAction()).orElse("").trim().toUpperCase();
        if ("APPROVE".equals(action)) {
            submission.setStatus(CloPloApprovalStatus.APPROVED);
            submission.setRejectionReason(null);
        } else if ("REJECT".equals(action)) {
            String reason = request == null ? null : request.getReason();
            if (reason == null || reason.isBlank()) throw new IllegalArgumentException("Lý do từ chối là bắt buộc.");
            submission.setStatus(CloPloApprovalStatus.REJECTED);
            submission.setRejectionReason(reason.trim());
        } else {
            throw new IllegalArgumentException("Hành động duyệt không hợp lệ.");
        }
        UserResponse reviewer = userClient.getUser(reviewerId);
        submission.setReviewedBy(reviewerId);
        submission.setReviewedByName(reviewer == null ? reviewerId : reviewer.getFullName());
        submission.setReviewedAt(LocalDateTime.now());
        submissionRepository.save(submission);
        return toResponse(course, submission);
    }

    private CloPloSubmissionResponse reviewClo(String cloId, String reviewerId, CloPloReviewRequest request) {
        CourseCLO clo = cloRepository.findById(cloId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy CLO."));
        if (clo.getApprovalStatus() != CloPloApprovalStatus.PENDING_REVIEW) {
            throw new IllegalStateException("Chỉ có thể xử lý CLO đang chờ duyệt.");
        }
        Course course = clo.getCourse();
        requireDeanScope(course, reviewerId);
        String action = request == null ? "" : Optional.ofNullable(request.getAction()).orElse("").trim().toUpperCase();
        if ("APPROVE".equals(action)) {
            clo.setApprovalStatus(CloPloApprovalStatus.APPROVED);
            clo.setRejectionReason(null);
        } else if ("REJECT".equals(action)) {
            String reason = request == null ? null : request.getReason();
            if (reason == null || reason.isBlank()) throw new IllegalArgumentException("Lý do từ chối là bắt buộc.");
            clo.setApprovalStatus(CloPloApprovalStatus.REJECTED);
            clo.setRejectionReason(reason.trim());
        } else {
            throw new IllegalArgumentException("Hành động duyệt không hợp lệ.");
        }
        UserResponse reviewer = userClient.getUser(reviewerId);
        clo.setReviewedBy(reviewerId);
        clo.setReviewedByName(reviewer == null ? reviewerId : reviewer.getFullName());
        clo.setReviewedAt(LocalDateTime.now());
        cloRepository.save(clo);
        return toResponse(course, null, clo);
    }

    private CloPloSubmissionResponse toResponse(Course course, CloPloSubmission submission) {
        return toResponse(course, submission, null);
    }

    private CloPloSubmissionResponse toResponse(Course course, CloPloSubmission submission, CourseCLO targetClo) {
        List<CourseCLO> allClos = clos(course.getCourseId());
        List<CourseCLO> responseClos = targetClo == null ? allClos : List.of(targetClo);
        List<ProgramPlo> plos = programPlos(course);
        Map<String, List<String>> mappings = mappingRepository
                .findByIdCloIdIn(allClos.stream().map(CourseCLO::getCloId).toList()).stream()
                .collect(Collectors.groupingBy(item -> item.getId().getCloId(),
                        Collectors.mapping(item -> item.getId().getPloId(), Collectors.toList())));
        return CloPloSubmissionResponse.builder()
                .submissionId(targetClo != null ? "CLO:" + targetClo.getCloId()
                        : submission == null ? null : submission.getSubmissionId())
                .courseId(course.getCourseId()).courseCode(course.getCourseCode()).courseName(course.getCourseName())
                .mainLecturerName(targetClo != null ? targetClo.getSubmittedByName()
                        : submission == null ? null : submission.getSubmittedByName())
                .submissionType(targetClo != null ? CloPloSubmissionType.CLO.name()
                        : submission == null || submission.getSubmissionType() == null ? null : submission.getSubmissionType().name())
                .status(targetClo != null ? targetClo.getApprovalStatus().name()
                        : submission == null ? CloPloApprovalStatus.DRAFT.name() : submission.getStatus().name())
                .revisionNumber(submission == null ? 0 : submission.getRevisionNumber())
                .submittedAt(targetClo != null ? targetClo.getSubmittedAt() : submission == null ? null : submission.getSubmittedAt())
                .reviewedBy(submission == null ? null : submission.getReviewedBy())
                .reviewedByName(targetClo != null ? targetClo.getReviewedByName() : submission == null ? null : submission.getReviewedByName())
                .reviewedAt(targetClo != null ? targetClo.getReviewedAt() : submission == null ? null : submission.getReviewedAt())
                .rejectionReason(targetClo != null ? targetClo.getRejectionReason() : submission == null ? null : submission.getRejectionReason())
                .cloWorkflow(null)
                .mappingWorkflow(workflow(course.getCourseId(), CloPloSubmissionType.CLO_PLO_MAPPING))
                .clos(responseClos.stream().map(clo -> CloPloSubmissionResponse.CloItem.builder()
                        .cloId(clo.getCloId()).cloCode(clo.getCloCode()).cloName(clo.getCloName())
                        .description(clo.getDescription()).bloomLevel(clo.getBloomLevel())
                        .approvalStatus(clo.getApprovalStatus().name()).submittedAt(clo.getSubmittedAt())
                        .reviewedByName(clo.getReviewedByName()).reviewedAt(clo.getReviewedAt())
                        .rejectionReason(clo.getRejectionReason())
                        .mappedPloIds(mappings.getOrDefault(clo.getCloId(), List.of())).build()).toList())
                .plos(plos.stream().map(plo -> CloPloSubmissionResponse.PloItem.builder()
                        .ploId(plo.getPloId()).ploCode(plo.getPloCode()).description(plo.getDescription()).build()).toList())
                .build();
    }

    private CloPloSubmissionResponse.WorkflowState workflow(String courseId, CloPloSubmissionType type) {
        CloPloSubmission submission = submissionRepository.findByCourseIdAndSubmissionType(courseId, type).orElse(null);
        return CloPloSubmissionResponse.WorkflowState.builder()
                .submissionId(submission == null ? null : submission.getSubmissionId())
                .status(submission == null ? CloPloApprovalStatus.DRAFT.name() : submission.getStatus().name())
                .revisionNumber(submission == null ? 0 : submission.getRevisionNumber())
                .submittedAt(submission == null ? null : submission.getSubmittedAt())
                .reviewedByName(submission == null ? null : submission.getReviewedByName())
                .reviewedAt(submission == null ? null : submission.getReviewedAt())
                .rejectionReason(submission == null ? null : submission.getRejectionReason())
                .build();
    }

    private List<CourseCLO> clos(String courseId) {
        return cloRepository.findByCourseCourseIdOrderByCloCodeAsc(courseId);
    }

    private List<ProgramPlo> programPlos(Course course) {
        String programId = course.getProgramId();
        if (programId == null || programId.isBlank()) {
            programId = programRepository.findByProgramCodeIgnoreCase(ProgramPloService.IT_PROGRAM_CODE)
                    .orElseThrow(() -> new IllegalStateException("Học phần chưa được gắn chương trình đào tạo."))
                    .getProgramId();
        }
        return ploRepository.findByProgramProgramIdOrderByPloCodeAsc(programId);
    }

    private Course requireCourse(String courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy học phần."));
    }

    private void requireEditable(CloPloSubmission submission) {
        if (submission.getStatus() == CloPloApprovalStatus.PENDING_REVIEW
                || submission.getStatus() == CloPloApprovalStatus.APPROVED) {
            throw new IllegalStateException("Không thể chỉnh sửa hồ sơ đang chờ duyệt hoặc đã duyệt.");
        }
    }

    private void requireMappingDraftable(CloPloSubmission submission) {
        if (submission.getStatus() == CloPloApprovalStatus.PENDING_REVIEW) {
            throw new IllegalStateException("Không thể chỉnh sửa mapping đang chờ duyệt.");
        }
    }

    private CloPloApprovalStatus parseStatus(String status) {
        try {
            return CloPloApprovalStatus.valueOf(Optional.ofNullable(status)
                    .orElse(CloPloApprovalStatus.PENDING_REVIEW.name()).toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Trạng thái hồ sơ không hợp lệ.");
        }
    }

    private boolean isDepartmentLeadership(String role) {
        return "HEAD_OF_DEPARTMENT".equals(role) || "DEPARTMENT_HEAD".equals(role);
    }

    private List<String> departmentCourseIds(String userId) {
        LecturerResponse lecturer = userClient.getLecturerByUserId(userId);
        if (lecturer == null || lecturer.getDepartment() == null) return List.of();
        return courseRepository.findByDepartment(lecturer.getDepartment()).stream().map(Course::getCourseId).toList();
    }

    private void requireDepartmentScope(Course course, String userId) {
        if (!departmentCourseIds(userId).contains(course.getCourseId())) {
            throw new SecurityException("Hồ sơ không thuộc đơn vị do bạn quản lý.");
        }
    }

    private List<String> deanCourseIds(String userId) {
        LecturerResponse lecturer = userClient.getLecturerByUserId(userId);
        if (lecturer == null || lecturer.getDepartment() == null || lecturer.getDepartment().isBlank()) return List.of();
        hcmuaf.edu.vn.fit.course_service.dto.response.FacultyResponse faculty =
                userClient.getFacultyByDepartmentName(userId, lecturer.getDepartment());
        if (faculty == null || faculty.getFacultyName() == null || faculty.getFacultyName().isBlank()) return List.of();
        List<String> departments = userClient.getDepartmentNamesByFaculty(userId, faculty.getFacultyName());
        if (departments == null || departments.isEmpty()) return List.of();
        return courseRepository.findByDepartmentIn(departments).stream().map(Course::getCourseId).toList();
    }

    private void requireDeanScope(Course course, String userId) {
        if (!deanCourseIds(userId).contains(course.getCourseId())) {
            throw new SecurityException("Hồ sơ không thuộc khoa do bạn quản lý.");
        }
    }

    private void requireMainLecturerScope(Course course, String userId) {
        LecturerResponse lecturer = userClient.getLecturerByUserId(userId);
        String lecturerId = lecturer == null ? null : lecturer.getLecturerId();
        boolean assigned = lecturerId != null && courseOfferingRepository
                .findByCourse_CourseId(course.getCourseId()).stream()
                .anyMatch(offering -> Objects.equals(lecturerId, offering.getMainLecturerId())
                        || (offering.getMainLecturerId() == null
                        && Objects.equals(lecturerId, offering.getLecturerId())));
        if (!assigned) {
            throw new SecurityException("Chỉ giảng viên chính được phân công học phần mới có quyền quản lý hồ sơ CLO - PLO.");
        }
    }
}
