package hcmuaf.edu.vn.fit.rubric_service.service;

import hcmuaf.edu.vn.fit.rubric_service.client.CourseClient;
import hcmuaf.edu.vn.fit.rubric_service.client.UserClient;
import hcmuaf.edu.vn.fit.rubric_service.dto.request.*;
import hcmuaf.edu.vn.fit.rubric_service.dto.response.*;
import hcmuaf.edu.vn.fit.rubric_service.entity.Rubric;
import hcmuaf.edu.vn.fit.rubric_service.entity.RubricApprovalRecord;
import hcmuaf.edu.vn.fit.rubric_service.entity.RubricCriteria;
import hcmuaf.edu.vn.fit.rubric_service.entity.RubricLevel;
import hcmuaf.edu.vn.fit.rubric_service.entity.RubricVersionHead;
import hcmuaf.edu.vn.fit.rubric_service.entity.enums.ApprovalRequestStatus;
import hcmuaf.edu.vn.fit.rubric_service.entity.enums.ApprovalReviewerRole;
import hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricStatus;
import hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricType;
import hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricVisibility;
import hcmuaf.edu.vn.fit.rubric_service.exception.ResourceNotFoundException;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricCriteriaRepository;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricLevelRepository;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricRepository;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricApprovalRecordRepository;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricVersionHeadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
@Slf4j
@Service
@RequiredArgsConstructor
public class RubricService {
    private final RubricRepository rubricRepository;
    private final UserClient userClient;
    private final CourseClient courseClient;
    private final RubricCriteriaRepository rubricCriteriaRepository;
    private final RubricLevelRepository rubricLevelRepository;
    private final RubricApprovalRecordRepository approvalRecordRepository;
    private final RubricVersionHeadRepository versionHeadRepository;
    private static final Comparator<RubricLevel> LEVEL_SCORE_DESC_COMPARATOR =
            Comparator.comparing(
                    RubricLevel::getScore,
                    Comparator.nullsLast(Comparator.reverseOrder())
            ).thenComparing(
                    RubricLevel::getLevelName,
                    Comparator.nullsLast(String::compareToIgnoreCase)
            );



    @Transactional(readOnly = true)
    public List<RubricResponse> getAllRubrics(String userId) {
        String lecturerId = resolveLecturerId(userId);
        List<Rubric> rubrics = lecturerId == null
                ? rubricRepository.findPublishedFacultyRubrics()
                : rubricRepository.findVisibleToLecturer(lecturerId);

        return rubrics.stream().map(this::toRubricResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<RubricResponse> getMyRubrics(String userId) {
        LecturerResponse lecturer = requireLecturer(userId);
        List<Rubric> rubrics = rubricRepository.findManageableByLecturer(lecturer.getLecturerId());
        return markCurrentHeads(rubrics, lecturer.getLecturerId());
    }

    @Transactional(readOnly = true)
    public List<RubricMatrixResponse> getRubricMatrices(String userId) {
        String lecturerId = resolveLecturerId(userId);
        List<Rubric> rubrics = lecturerId == null
                ? rubricRepository.findPublishedFacultyRubrics()
                : rubricRepository.findManageableByLecturer(lecturerId);

        return markCurrentMatrixHeads(rubrics, lecturerId);
    }

    public RubricMatrixResponse getRubricMatrixDetail(String rubricId, String userId) {
        Rubric rubric = getVisibleRubric(rubricId, userId);

        return toMatrixResponse(rubric);
    }

    private RubricMatrixResponse toMatrixResponse(Rubric rubric) {
        List<RubricCriteria> criteriaList =
                rubric.getCriteria() == null ? List.of() : rubric.getCriteria().stream().toList();

        Float totalWeight = criteriaList.stream()
                .map(c -> c.getWeight() == null ? 0f : c.getWeight())
                .reduce(0f, Float::sum);

        long cloCount = criteriaList.stream()
                .map(RubricCriteria::getCloId)
                .filter(Objects::nonNull)
                .distinct()
                .count();

        List<RubricMatrixRowResponse> rows = criteriaList.stream()
                .map(c -> RubricMatrixRowResponse.builder()
                        .cloId(c.getCloId())
                        .criteriaId(c.getCriteriaId())
                        .criteriaName(c.getCriteriaName())
                        .weight(c.getWeight())
                        .levels(
                                c.getLevels() == null ? List.of() :
                                        c.getLevels().stream()
                                                .sorted(LEVEL_SCORE_DESC_COMPARATOR)
                                                .map(l -> RubricLevelResponse.builder()
                                                        .levelId(l.getLevelId())
                                                        .levelName(l.getLevelName())
                                                        .description(l.getDescription())
                                                        .score(l.getScore())
                                                        .build()
                                                )
                                                .toList()
                        )
                        .build()
                )
                .toList();

        return RubricMatrixResponse.builder()
                .id(rubric.getRubricId())
                .name(rubric.getRubricName())
                .description(rubric.getDescription())
                .courseId(rubric.getCourseId())
                .rubricType(rubric.getRubricType() == null ? null : rubric.getRubricType().name())
                .rootRubricId(rubric.getRootRubricId())
                .parentRubricId(rubric.getParentRubricId())
                .versionNumber(rubric.getVersionNumber())
                .approvalStatus(rubric.getStatus() == null ? null : rubric.getStatus().name())
                .courses(0)
                .cloCount((int) cloCount)
                .criteriaCount(criteriaList.size())
                .totalWeight(totalWeight)
                .status(totalWeight >= 100 ? "Hoàn tất" : "Chưa hoàn tất")
                .rows(rows)
                .build();
    }

    @Transactional(readOnly = true)
    public Rubric getById(String id, String userId) {
        return getVisibleRubric(id, userId);
    }

    public Rubric create(Rubric rubric) {

        return rubricRepository.save(rubric);
    }
    @Transactional
    public Rubric createRubric(String lecturerId, RubricRequest request) {

        LecturerResponse lecturer = userClient.getLecturerByUserId(lecturerId);
        if (lecturer == null) {
            throw new RuntimeException("Không tìm thấy thông tin Giảng viên!");
        }


        RubricStatus initialStatus = request.isSubmitForApproval() ? RubricStatus.PENDING : RubricStatus.DRAFT;
        LocalDateTime submissionTime = request.isSubmitForApproval() ? LocalDateTime.now() : null;


        String generatedRubricId = "RB-" + System.currentTimeMillis();
        Rubric newRubric = Rubric.builder()
                .rubricId(generatedRubricId)
                .rubricName(request.getRubricName())
                .courseId(request.getCourseId())
                .description(request.getDescription())
                .lecturerId(lecturer.getLecturerId())
                .createdBy(lecturer.getFullName())
                .status(initialStatus)
                .rubricType(RubricType.FACULTY)
                .visibility(RubricVisibility.FACULTY)
                .rootRubricId(generatedRubricId)
                .versionNumber(1)
                .submittedAt(submissionTime)
                .build();

        Rubric savedRubric = rubricRepository.save(newRubric);


        if (request.getCriteria() != null && !request.getCriteria().isEmpty()) {
            for (CriterionRequest crDto : request.getCriteria()) {


                String generatedCriteriaId = "CR-" + java.util.UUID.randomUUID().toString().substring(0, 8);
                RubricCriteria criteriaEntity = RubricCriteria.builder()
                        .criteriaId(generatedCriteriaId)
                        .criteriaName(crDto.getName())
                        .description(crDto.getDescription())
                        .weight(crDto.getWeight())
                        .cloId(crDto.getCloId())
                        .rubric(savedRubric)
                        .build();


                RubricCriteria savedCriteria = rubricCriteriaRepository.save(criteriaEntity);


                if (crDto.getLevels() != null && !crDto.getLevels().isEmpty()) {
                    List<RubricLevel> levelEntities = new ArrayList<>();

                    for (LevelRequest lvlDto : crDto.getLevels()) {
                        String generatedLevelId = "LV-" + java.util.UUID.randomUUID().toString().substring(0, 8);

                        RubricLevel levelEntity = RubricLevel.builder()
                                .levelId(generatedLevelId)
                                .criteria(savedCriteria)
                                .levelName(lvlDto.getName())
                                .description(lvlDto.getDescription())
                                .score(lvlDto.getScore())
                                .build();

                        levelEntities.add(levelEntity);
                    }

                    rubricLevelRepository.saveAll(levelEntities);
                }
            }
        }

        if (request.isSubmitForApproval()) {
            createApprovalRecord(savedRubric, lecturerId);
        }

        return savedRubric;
    }

    @Transactional
    public Rubric cloneRubric(String sourceRubricId, String userId, RubricCloneRequest request) {
        UserResponse requester = userClient.getUser(userId);
        if (requester == null || !"MAIN_LECTURER".equals(requester.getRole())) {
            throw new SecurityException("Chỉ giảng viên chính được tạo rubric version riêng.");
        }
        LecturerResponse lecturer = requireLecturer(userId);
        Rubric source = rubricRepository.findWithCriteriaAndLevelsByRubricId(sourceRubricId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy rubric nguồn: " + sourceRubricId));

        if (source.getRubricType() != RubricType.FACULTY
                || source.getVisibility() != RubricVisibility.FACULTY
                || source.getStatus() != RubricStatus.APPROVED) {
            throw new IllegalArgumentException("Chỉ được tạo version riêng từ rubric chung đã được phê duyệt.");
        }

        String rootRubricId = source.getRootRubricId() == null
                ? source.getRubricId()
                : source.getRootRubricId();
        int nextVersion = rubricRepository.findMaxVersionNumber(rootRubricId) + 1;
        String requestedName = request == null ? null : request.getRubricName();
        String requestedDescription = request == null ? null : request.getDescription();

        Rubric variant = Rubric.builder()
                .rubricId(newId("RB"))
                .lecturerId(lecturer.getLecturerId())
                .courseId(source.getCourseId())
                .facultyId(source.getFacultyId())
                .rubricName(hasText(requestedName)
                        ? requestedName.trim()
                        : source.getRubricName() + " - Bản riêng v" + nextVersion)
                .description(hasText(requestedDescription) ? requestedDescription : source.getDescription())
                .createdBy(lecturer.getFullName())
                .rubricType(RubricType.LECTURER_VARIANT)
                .visibility(RubricVisibility.PRIVATE)
                .rootRubricId(rootRubricId)
                .parentRubricId(source.getRubricId())
                .versionNumber(nextVersion)
                .status(RubricStatus.PENDING)
                .submittedAt(LocalDateTime.now())
                .criteria(new HashSet<>())
                .build();
        Rubric savedVariant = rubricRepository.save(variant);

        if (source.getCriteria() != null) {
            for (RubricCriteria sourceCriterion : source.getCriteria()) {
                RubricCriteria clonedCriterion = RubricCriteria.builder()
                        .criteriaId(newId("CR"))
                        .rubric(savedVariant)
                        .cloId(sourceCriterion.getCloId())
                        .criteriaName(sourceCriterion.getCriteriaName())
                        .description(sourceCriterion.getDescription())
                        .weight(sourceCriterion.getWeight())
                        .levels(new HashSet<>())
                        .build();
                RubricCriteria savedCriterion = rubricCriteriaRepository.save(clonedCriterion);

                if (sourceCriterion.getLevels() != null) {
                    List<RubricLevel> clonedLevels = sourceCriterion.getLevels().stream()
                            .map(sourceLevel -> RubricLevel.builder()
                                    .levelId(newId("LV"))
                                    .criteria(savedCriterion)
                                    .levelName(sourceLevel.getLevelName())
                                    .description(sourceLevel.getDescription())
                                    .score(sourceLevel.getScore())
                                    .build())
                            .toList();
                    rubricLevelRepository.saveAll(clonedLevels);
                }
            }
        }

        createApprovalRecord(savedVariant, userId);
        moveHead(rootRubricId, lecturer.getLecturerId(), savedVariant.getRubricId());
        return rubricRepository.findWithCriteriaAndLevelsByRubricId(savedVariant.getRubricId())
                .orElse(savedVariant);
    }

    @Transactional
    public Rubric createEditedVersion(String sourceRubricId, String userId, RubricRequest request) {
        UserResponse requester = userClient.getUser(userId);
        if (requester == null || !"MAIN_LECTURER".equals(requester.getRole())) {
            throw new SecurityException("Chỉ giảng viên chính được chỉnh sửa rubric và tạo version mới.");
        }
        LecturerResponse lecturer = requireLecturer(userId);
        Rubric source = getVisibleRubric(sourceRubricId, userId);
        if (source.getStatus() != RubricStatus.APPROVED && source.getStatus() != RubricStatus.REJECTED) {
            throw new IllegalStateException("Không thể chỉnh sửa rubric đang chờ duyệt.");
        }
        if (source.getRubricType() == RubricType.LECTURER_VARIANT
                && !Objects.equals(source.getLecturerId(), lecturer.getLecturerId())) {
            throw new SecurityException("Bạn không phải chủ sở hữu rubric version này.");
        }
        if (request == null || request.getCriteria() == null || request.getCriteria().isEmpty()) {
            throw new IllegalArgumentException("Rubric version phải có ít nhất một tiêu chí.");
        }

        String rootRubricId = source.getRootRubricId() == null
                ? source.getRubricId()
                : source.getRootRubricId();
        int nextVersion = rubricRepository.findMaxVersionNumber(rootRubricId) + 1;
        Rubric version = Rubric.builder()
                .rubricId(newId("RB"))
                .lecturerId(lecturer.getLecturerId())
                .courseId(hasText(request.getCourseId()) ? request.getCourseId() : source.getCourseId())
                .facultyId(source.getFacultyId())
                .rubricName(hasText(request.getRubricName()) ? request.getRubricName().trim() : source.getRubricName())
                .description(request.getDescription())
                .createdBy(lecturer.getFullName())
                .rubricType(RubricType.LECTURER_VARIANT)
                .visibility(RubricVisibility.PRIVATE)
                .rootRubricId(rootRubricId)
                .parentRubricId(source.getRubricId())
                .versionNumber(nextVersion)
                .status(RubricStatus.PENDING)
                .submittedAt(LocalDateTime.now())
                .criteria(new HashSet<>())
                .build();
        Rubric savedVersion = rubricRepository.save(version);
        saveCriteria(request.getCriteria(), savedVersion);
        createApprovalRecord(savedVersion, userId);
        moveHead(rootRubricId, lecturer.getLecturerId(), savedVersion.getRubricId());
        return rubricRepository.findWithCriteriaAndLevelsByRubricId(savedVersion.getRubricId())
                .orElse(savedVersion);
    }

    @Transactional(readOnly = true)
    public RubricComparisonResponse compareVersions(String rubricId, String userId) {
        Rubric proposed = getVisibleRubric(rubricId, userId);
        RubricResponse previous = null;
        if (proposed.getParentRubricId() != null) {
            Rubric parent = rubricRepository.findWithCriteriaAndLevelsByRubricId(proposed.getParentRubricId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy version gốc: " + proposed.getParentRubricId()
                    ));
            previous = toRubricResponse(parent);
        }
        return RubricComparisonResponse.builder()
                .previousVersion(previous)
                .proposedVersion(toRubricResponse(proposed))
                .build();
    }

    @Transactional(readOnly = true)
    public List<RubricResponse> getVersionHistory(String rubricId, String userId) {
        LecturerResponse lecturer = requireLecturer(userId);
        Rubric selected = getVisibleRubric(rubricId, userId);
        String rootRubricId = selected.getRootRubricId() == null
                ? selected.getRubricId()
                : selected.getRootRubricId();
        return markCurrentHeads(
                rubricRepository.findVersionHistory(rootRubricId, lecturer.getLecturerId()),
                lecturer.getLecturerId()
        );
    }

    @Transactional
    public RubricResponse revertHead(String rubricId, String userId) {
        UserResponse requester = userClient.getUser(userId);
        if (requester == null || !"MAIN_LECTURER".equals(requester.getRole())) {
            throw new SecurityException("Chỉ giảng viên chính được chuyển HEAD của rubric.");
        }

        LecturerResponse lecturer = requireLecturer(userId);
        Rubric selected = getVisibleRubric(rubricId, userId);
        if (selected.getRubricType() == RubricType.LECTURER_VARIANT
                && !Objects.equals(selected.getLecturerId(), lecturer.getLecturerId())) {
            throw new SecurityException("Bạn không thể chuyển HEAD sang nhánh rubric của giảng viên khác.");
        }

        String rootRubricId = selected.getRootRubricId() == null
                ? selected.getRubricId()
                : selected.getRootRubricId();
        moveHead(rootRubricId, lecturer.getLecturerId(), selected.getRubricId());

        RubricResponse response = toRubricResponse(selected);
        response.setCurrentHead(true);
        return response;
    }

    @Transactional
    public Rubric submitForApproval(String rubricId, String userId) {
        LecturerResponse lecturer = requireLecturer(userId);
        UserResponse requester = userClient.getUser(userId);
        Rubric rubric = rubricRepository.findById(rubricId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy rubric: " + rubricId));
        if (!Objects.equals(rubric.getLecturerId(), lecturer.getLecturerId())) {
            throw new SecurityException("Bạn không phải chủ sở hữu rubric này.");
        }
        if (rubric.getRubricType() == RubricType.LECTURER_VARIANT
                && (requester == null || !"MAIN_LECTURER".equals(requester.getRole()))) {
            throw new SecurityException("Chỉ giảng viên chính được gửi lại rubric version.");
        }
        if (rubric.getStatus() != RubricStatus.DRAFT && rubric.getStatus() != RubricStatus.REJECTED) {
            throw new IllegalStateException("Chỉ rubric DRAFT hoặc REJECTED mới được gửi duyệt.");
        }

        rubric.setStatus(RubricStatus.PENDING);
        rubric.setSubmittedAt(LocalDateTime.now());
        rubric.setReviewedAt(null);
        rubric.setReviewedBy(null);
        rubric.setFeedback(null);
        Rubric saved = rubricRepository.save(rubric);
        createApprovalRecord(saved, userId);
        return saved;
    }

    public void delete(String id) {
        rubricRepository.deleteById(id);
    }


    public List<Rubric> getRubricsForApproval(String userId, String statusParam) {
        RubricStatus status = RubricStatus.valueOf(statusParam.toUpperCase());
        UserResponse user = userClient.getUser(userId);

        if ("DEAN".equals(user.getRole())) {
            return rubricRepository.findByStatusAndRubricType(status, RubricType.FACULTY);
        } else if (isDepartmentHead(user)) {
            LecturerResponse lecturerResponse = userClient.getLecturerByUserId(userId);
            String department = lecturerResponse.getDepartment();
            List<String> departmentCourseIds = courseClient.getCoursesByDepartment(department)
                    .stream()
                    .map(CourseDto::getCourseId)
                    .collect(Collectors.toList());

            if (departmentCourseIds.isEmpty()) return List.of();
            return rubricRepository.findByStatusAndRubricTypeAndCourseIdsIn(
                    status,
                    RubricType.LECTURER_VARIANT,
                    departmentCourseIds
            );
        } else {
            throw new SecurityException("Bạn không có quyền truy cập tính năng này.");
        }
    }


    @Transactional
    public Rubric reviewRubric(String rubricId, String reviewerId, RubricApprovalRequest request) {
        UserResponse reviewer = userClient.getUser(reviewerId);
        Rubric rubric = rubricRepository.findById(rubricId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Rubric với ID: " + rubricId));

        boolean isVariant = rubric.getRubricType() == RubricType.LECTURER_VARIANT;
        if (isVariant) {
            if (!isDepartmentHead(reviewer) || !isRubricInReviewerDepartment(reviewerId, rubric)) {
                throw new SecurityException("Chỉ Trưởng bộ môn phụ trách học phần được phê duyệt rubric version.");
            }
        } else if (reviewer == null || !"DEAN".equals(reviewer.getRole())) {
            throw new SecurityException("Chỉ Trưởng khoa được phê duyệt rubric dùng chung.");
        }

        if (!rubric.getStatus().equals(RubricStatus.PENDING)) {
            throw new RuntimeException("Chỉ có thể phê duyệt Rubric đang ở trạng thái Chờ duyệt (PENDING).");
        }

        ApprovalRequestStatus approvalStatus;
        if ("APPROVE".equalsIgnoreCase(request.getAction())) {
            rubric.setStatus(RubricStatus.APPROVED);
            rubric.setFeedback(null);
            approvalStatus = ApprovalRequestStatus.APPROVED;
        } else if ("REJECT".equalsIgnoreCase(request.getAction())) {
            if (request.getFeedback() == null || request.getFeedback().trim().isEmpty()) {
                throw new IllegalArgumentException("Vui lòng nhập lý do từ chối để giảng viên chỉnh sửa.");
            }
            rubric.setStatus(RubricStatus.REJECTED);
            rubric.setFeedback(request.getFeedback());
            approvalStatus = ApprovalRequestStatus.REJECTED;
        } else {
            throw new IllegalArgumentException("Hành động không hợp lệ. Chỉ chấp nhận APPROVE hoặc REJECT.");
        }

        rubric.setReviewedBy(reviewerId);
        rubric.setReviewedAt(LocalDateTime.now());

        RubricApprovalRecord approvalRecord = approvalRecordRepository
                .findTopByRubricIdOrderByRevisionNumberDesc(rubricId)
                .orElseGet(() -> createMissingApprovalRecord(rubric));
        if (approvalRecord.getStatus() != ApprovalRequestStatus.PENDING) {
            throw new IllegalStateException("Yêu cầu duyệt gần nhất đã được xử lý.");
        }
        approvalRecord.setStatus(approvalStatus);
        approvalRecord.setReviewedBy(reviewerId);
        approvalRecord.setReviewedAt(rubric.getReviewedAt());
        approvalRecord.setFeedback(rubric.getFeedback());
        approvalRecordRepository.save(approvalRecord);

        // notificationClient.notifyRubricReviewed(rubric.getCreatedBy(), rubricId, request.getAction());

        return rubricRepository.save(rubric);
    }
    public List<ActivityResponse> getRecentActivities(String departmentId,int limit) {
        // Lấy danh sách Rubric mới nhất từ DB
        List<Rubric> recentRubrics = rubricRepository.findTop20ByOrderByCreatedAtDesc();

        return recentRubrics.stream()
                .limit(limit)
                .map(rubric -> {
                    
                    String actionText = switch (rubric.getStatus()) {
                        case APPROVED -> "đã được phê duyệt.";
                        case PENDING -> "vừa được trình duyệt.";
                        case REJECTED -> "bị từ chối phê duyệt.";
                        default -> "vừa được tạo/cập nhật nháp.";
                    };

                    return ActivityResponse.builder()

                            .id(Math.abs(rubric.getRubricId().hashCode()))
                            .type("rubric")
                            .description("Rubric [" + rubric.getRubricName() + "] của học phần " + rubric.getCourseId() + " " + actionText)
                            .timeAgo(calculateTimeAgo(rubric.getCreatedAt()))
                            .isNew(rubric.getStatus() == RubricStatus.PENDING) // Đánh dấu 'mới' nếu đang chờ duyệt
                            .build();
                })
                .collect(Collectors.toList());
    }

    private RubricResponse toRubricResponse(Rubric rubric) {
        List<RubricCriteria> criteria = rubric.getCriteria() == null
                ? List.of()
                : rubric.getCriteria().stream().toList();
        return RubricResponse.builder()
                .id(rubric.getRubricId())
                .name(rubric.getRubricName())
                .description(rubric.getDescription())
                .facultyId(rubric.getFacultyId())
                .lecturerId(rubric.getLecturerId())
                .rubricType(rubric.getRubricType().name())
                .visibility(rubric.getVisibility().name())
                .rootRubricId(rubric.getRootRubricId())
                .parentRubricId(rubric.getParentRubricId())
                .versionNumber(rubric.getVersionNumber())
                .status(rubric.getStatus().name())
                .totalWeight(criteria.stream()
                        .map(c -> c.getWeight() == null ? 0f : c.getWeight())
                        .reduce(0f, Float::sum))
                .criteria(criteria.stream()
                        .map(c -> CriteriaResponse.builder()
                                .id(c.getCriteriaId())
                                .cloId(c.getCloId())
                                .name(c.getCriteriaName())
                                .description(c.getDescription())
                                .weight(c.getWeight())
                                .levels(c.getLevels() == null ? List.of() : c.getLevels().stream()
                                        .sorted(LEVEL_SCORE_DESC_COMPARATOR)
                                        .map(level -> RubricLevelResponse.builder()
                                                .levelId(level.getLevelId())
                                                .levelName(level.getLevelName())
                                                .description(level.getDescription())
                                                .score(level.getScore())
                                                .build())
                                        .toList())
                                .build())
                        .toList())
                .build();
    }

    private List<RubricResponse> markCurrentHeads(List<Rubric> rubrics, String lecturerId) {
        var availableRubricIds = rubrics.stream()
                .map(Rubric::getRubricId)
                .collect(Collectors.toSet());
        Map<String, String> storedHeads = versionHeadRepository.findByLecturerId(lecturerId).stream()
                .collect(Collectors.toMap(
                        RubricVersionHead::getRootRubricId,
                        RubricVersionHead::getRubricId,
                        (first, second) -> second
                ));
        Map<String, Rubric> fallbackHeads = rubrics.stream()
                .collect(Collectors.toMap(
                        this::rootIdOf,
                        Function.identity(),
                        (first, second) -> compareVersion(first, second) >= 0 ? first : second
                ));

        return rubrics.stream().map(rubric -> {
            String rootRubricId = rootIdOf(rubric);
            String headRubricId = storedHeads.get(rootRubricId);
            if (headRubricId == null || !availableRubricIds.contains(headRubricId)) {
                headRubricId = fallbackHeads.get(rootRubricId).getRubricId();
            }
            RubricResponse response = toRubricResponse(rubric);
            response.setCurrentHead(rubric.getRubricId().equals(headRubricId));
            return response;
        }).toList();
    }

    private List<RubricMatrixResponse> markCurrentMatrixHeads(List<Rubric> rubrics, String lecturerId) {
        Map<String, String> storedHeads = lecturerId == null
                ? Map.of()
                : versionHeadRepository.findByLecturerId(lecturerId).stream()
                        .collect(Collectors.toMap(
                                RubricVersionHead::getRootRubricId,
                                RubricVersionHead::getRubricId,
                                (first, second) -> second
                        ));
        Map<String, Rubric> fallbackHeads = rubrics.stream()
                .collect(Collectors.toMap(
                        this::rootIdOf,
                        Function.identity(),
                        (first, second) -> compareVersion(first, second) >= 0 ? first : second
                ));
        var availableRubricIds = rubrics.stream()
                .map(Rubric::getRubricId)
                .collect(Collectors.toSet());

        return rubrics.stream().map(rubric -> {
            String rootRubricId = rootIdOf(rubric);
            String headRubricId = storedHeads.get(rootRubricId);
            if (headRubricId == null || !availableRubricIds.contains(headRubricId)) {
                headRubricId = fallbackHeads.get(rootRubricId).getRubricId();
            }
            RubricMatrixResponse response = toMatrixResponse(rubric);
            response.setCurrentHead(rubric.getRubricId().equals(headRubricId));
            return response;
        }).toList();
    }

    private int compareVersion(Rubric first, Rubric second) {
        int versionComparison = Comparator.nullsFirst(Integer::compareTo)
                .compare(first.getVersionNumber(), second.getVersionNumber());
        if (versionComparison != 0) {
            return versionComparison;
        }
        return Comparator.nullsFirst(LocalDateTime::compareTo)
                .compare(first.getCreatedAt(), second.getCreatedAt());
    }

    private String rootIdOf(Rubric rubric) {
        return rubric.getRootRubricId() == null ? rubric.getRubricId() : rubric.getRootRubricId();
    }

    private void moveHead(String rootRubricId, String lecturerId, String rubricId) {
        RubricVersionHead head = versionHeadRepository
                .findByRootRubricIdAndLecturerId(rootRubricId, lecturerId)
                .orElseGet(() -> RubricVersionHead.builder()
                        .headId(newId("RVH"))
                        .rootRubricId(rootRubricId)
                        .lecturerId(lecturerId)
                        .build());
        head.setRubricId(rubricId);
        versionHeadRepository.save(head);
    }

    private Rubric getVisibleRubric(String rubricId, String userId) {
        Rubric rubric = rubricRepository.findWithCriteriaAndLevelsByRubricId(rubricId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy rubric: " + rubricId));

        if (rubric.getVisibility() == RubricVisibility.FACULTY
                && rubric.getStatus() == RubricStatus.APPROVED) {
            return rubric;
        }
        if (userId == null || userId.isBlank()) {
            throw new SecurityException("Bạn không có quyền xem rubric này.");
        }

        UserResponse user = userClient.getUser(userId);
        if (user != null && "DEAN".equals(user.getRole())) {
            return rubric;
        }
        if (isDepartmentHead(user) && isRubricInReviewerDepartment(userId, rubric)) {
            return rubric;
        }

        String lecturerId = resolveLecturerId(userId);
        if (lecturerId != null && Objects.equals(lecturerId, rubric.getLecturerId())) {
            return rubric;
        }
        throw new SecurityException("Bạn không có quyền xem rubric version này.");
    }

    private String resolveLecturerId(String userId) {
        if (userId == null || userId.isBlank()) {
            return null;
        }
        try {
            LecturerResponse lecturer = userClient.getLecturerByUserId(userId);
            return lecturer == null ? null : lecturer.getLecturerId();
        } catch (Exception ignored) {
            return null;
        }
    }

    private LecturerResponse requireLecturer(String userId) {
        LecturerResponse lecturer = userClient.getLecturerByUserId(userId);
        if (lecturer == null || lecturer.getLecturerId() == null) {
            throw new ResourceNotFoundException("Không tìm thấy hồ sơ giảng viên.");
        }
        return lecturer;
    }

    private RubricApprovalRecord createApprovalRecord(Rubric rubric, String submittedBy) {
        int revision = approvalRecordRepository.findTopByRubricIdOrderByRevisionNumberDesc(rubric.getRubricId())
                .map(record -> {
                    if (record.getStatus() == ApprovalRequestStatus.PENDING) {
                        throw new IllegalStateException("Rubric đã có một yêu cầu đang chờ duyệt.");
                    }
                    return record.getRevisionNumber() + 1;
                })
                .orElse(1);

        return approvalRecordRepository.save(RubricApprovalRecord.builder()
                .approvalRequestId(newId("RAR"))
                .rubricId(rubric.getRubricId())
                .revisionNumber(revision)
                .submittedBy(submittedBy)
                .requiredReviewerRole(requiredReviewerRole(rubric))
                .status(ApprovalRequestStatus.PENDING)
                .requestedAt(rubric.getSubmittedAt() == null ? LocalDateTime.now() : rubric.getSubmittedAt())
                .build());
    }

    private void saveCriteria(List<CriterionRequest> criteriaRequests, Rubric rubric) {
        for (CriterionRequest criterionRequest : criteriaRequests) {
            RubricCriteria criterion = rubricCriteriaRepository.save(RubricCriteria.builder()
                    .criteriaId(newId("CR"))
                    .rubric(rubric)
                    .cloId(criterionRequest.getCloId())
                    .criteriaName(criterionRequest.getName())
                    .description(criterionRequest.getDescription())
                    .weight(criterionRequest.getWeight())
                    .levels(new HashSet<>())
                    .build());
            if (criterionRequest.getLevels() != null) {
                rubricLevelRepository.saveAll(criterionRequest.getLevels().stream()
                        .map(level -> RubricLevel.builder()
                                .levelId(newId("LV"))
                                .criteria(criterion)
                                .levelName(level.getName())
                                .description(level.getDescription())
                                .score(level.getScore())
                                .build())
                        .toList());
            }
        }
    }

    private RubricApprovalRecord createMissingApprovalRecord(Rubric rubric) {
        LecturerResponse lecturer = userClient.getLecturer(rubric.getLecturerId());
        if (lecturer == null || lecturer.getUserId() == null) {
            throw new IllegalStateException("Không xác định được người gửi rubric.");
        }
        return RubricApprovalRecord.builder()
                .approvalRequestId(newId("RAR"))
                .rubricId(rubric.getRubricId())
                .revisionNumber(1)
                .submittedBy(lecturer.getUserId())
                .requiredReviewerRole(requiredReviewerRole(rubric))
                .status(ApprovalRequestStatus.PENDING)
                .requestedAt(rubric.getSubmittedAt() == null ? rubric.getCreatedAt() : rubric.getSubmittedAt())
                .build();
    }

    private static String newId(String prefix) {
        return prefix + "-" + UUID.randomUUID();
    }

    private ApprovalReviewerRole requiredReviewerRole(Rubric rubric) {
        return rubric.getRubricType() == RubricType.LECTURER_VARIANT
                ? ApprovalReviewerRole.HEAD_OF_DEPARTMENT
                : ApprovalReviewerRole.DEAN;
    }

    private boolean isDepartmentHead(UserResponse user) {
        return user != null && ("HEAD_OF_DEPARTMENT".equals(user.getRole())
                || "DEPARTMENT_HEAD".equals(user.getRole()));
    }

    private boolean isRubricInReviewerDepartment(String reviewerId, Rubric rubric) {
        if (rubric.getCourseId() == null) {
            return false;
        }
        LecturerResponse reviewer = userClient.getLecturerByUserId(reviewerId);
        if (reviewer == null || reviewer.getDepartment() == null) {
            return false;
        }
        return courseClient.getCoursesByDepartment(reviewer.getDepartment()).stream()
                .map(CourseDto::getCourseId)
                .anyMatch(rubric.getCourseId()::equals);
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    // Hàm phụ trợ tính toán khoảng thời gian (10 phút trước, 2 giờ trước...)
    private String calculateTimeAgo(LocalDateTime pastTime) {
        if (pastTime == null) return "Gần đây";

        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(pastTime, now);

        if (minutes < 60) {
            return (minutes <= 0 ? 1 : minutes) + " phút trước";
        }

        long hours = ChronoUnit.HOURS.between(pastTime, now);
        if (hours < 24) {
            return hours + " giờ trước";
        }

        long days = ChronoUnit.DAYS.between(pastTime, now);
        return days + " ngày trước";
    }
}
