package hcmuaf.edu.vn.fit.rubric_service.service;

import hcmuaf.edu.vn.fit.rubric_service.client.CourseClient;
import hcmuaf.edu.vn.fit.rubric_service.client.UserClient;
import hcmuaf.edu.vn.fit.rubric_service.dto.request.CriterionRequest;
import hcmuaf.edu.vn.fit.rubric_service.dto.request.LevelRequest;
import hcmuaf.edu.vn.fit.rubric_service.dto.request.RubricApprovalRequest;
import hcmuaf.edu.vn.fit.rubric_service.dto.request.RubricRequest;
import hcmuaf.edu.vn.fit.rubric_service.dto.response.*;
import hcmuaf.edu.vn.fit.rubric_service.entity.Rubric;
import hcmuaf.edu.vn.fit.rubric_service.entity.RubricCriteria;
import hcmuaf.edu.vn.fit.rubric_service.entity.RubricLevel;
import hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricStatus;
import hcmuaf.edu.vn.fit.rubric_service.exception.ResourceNotFoundException;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricCriteriaRepository;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricLevelRepository;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RubricService {
    private final RubricRepository rubricRepository;
    private final UserClient userClient;
    private final CourseClient courseClient;
    private final RubricCriteriaRepository rubricCriteriaRepository;
    private final RubricLevelRepository rubricLevelRepository;
    private static final Comparator<RubricLevel> LEVEL_SCORE_DESC_COMPARATOR =
            Comparator.comparing(
                    RubricLevel::getScore,
                    Comparator.nullsLast(Comparator.reverseOrder())
            ).thenComparing(
                    RubricLevel::getLevelName,
                    Comparator.nullsLast(String::compareToIgnoreCase)
            );



    public List<RubricResponse> getAllRubrics() {

        List<Rubric> rubrics =
                rubricRepository.findByStatus(RubricStatus.APPROVED);

        return rubrics.stream()
                .map(rubric -> RubricResponse.builder()

                        .id(rubric.getRubricId())

                        .name(rubric.getRubricName())

                        .description(rubric.getDescription())

                        .totalWeight(
                                rubric.getCriteria()
                                        .stream()
                                        .map(c -> c.getWeight() == null ? 0f : c.getWeight())
                                        .reduce(0f, Float::sum)
                        )

                        .criteria(
                                rubric.getCriteria()
                                        .stream()
                                        .map(c -> CriteriaResponse.builder()
                                                .id(c.getCriteriaId())
                                                .cloId(c.getCloId())
                                                .name(c.getCriteriaName())
                                                .weight(c.getWeight())
                                                .build()
                                        )
                                        .toList()
                        )

                        .build())
                .toList();
    }
    public List<RubricMatrixResponse> getRubricMatrices() {
        List<Rubric> rubrics = rubricRepository.findAllByOrderByRubricNameAsc();

        return rubrics.stream()
                .map(this::toMatrixResponse)
                .toList();
    }

    public RubricMatrixResponse getRubricMatrixDetail(String rubricId) {
        Rubric rubric = rubricRepository
                .findWithCriteriaAndLevelsByRubricId(rubricId)
                .orElseThrow(() -> new RuntimeException("Rubric not found: " + rubricId));

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
                .courses(0)
                .cloCount((int) cloCount)
                .criteriaCount(criteriaList.size())
                .totalWeight(totalWeight)
                .status(totalWeight >= 100 ? "Hoàn tất" : "Chưa hoàn tất")
                .rows(rows)
                .build();
    }

    public Rubric getById(String id) {
        return rubricRepository.findById(id).orElse(null);
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
                .createdBy(lecturer.getFullName())
                .status(initialStatus)
                .reviewedAt(submissionTime) // Giữ nguyên trường bạn đang dùng, hoặc đổi thành submittedAt tùy ý
                .build();

        Rubric savedRubric = rubricRepository.save(newRubric);


        if (request.getCriteria() != null && !request.getCriteria().isEmpty()) {
            for (CriterionRequest crDto : request.getCriteria()) {


                String generatedCriteriaId = "CR-" + java.util.UUID.randomUUID().toString().substring(0, 8);
                RubricCriteria criteriaEntity = RubricCriteria.builder()
                        .criteriaId(generatedCriteriaId)
                        .criteriaName(crDto.getName())
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

        return savedRubric;
    }
    public void delete(String id) {
        rubricRepository.deleteById(id);
    }


    public List<Rubric> getRubricsForApproval(String userId, String statusParam) {
        RubricStatus status = RubricStatus.valueOf(statusParam.toUpperCase());
        UserResponse user = userClient.getUser(userId);

        if ("DEAN".equals(user.getRole())) {

            return rubricRepository.findByStatus(status);

        } else if ("HEAD_OF_DEPARTMENT".equals(user.getRole())) {

            LecturerResponse lecturerResponse = userClient.getLecturerByUserId(userId);
            String department = lecturerResponse.getDepartment();


            List<String> departmentCourseIds = courseClient.getCoursesByDepartment(department)
                    .stream()
                    .map(CourseDto::getCourseId)
                    .collect(Collectors.toList());

            if (departmentCourseIds.isEmpty()) return List.of();

            return rubricRepository.findByStatusAndCourseIdsIn(status, departmentCourseIds);
        } else {
            throw new RuntimeException("Bạn không có quyền truy cập tính năng này.");
        }
    }


    @Transactional
    public Rubric reviewRubric(String rubricId, String reviewerId, RubricApprovalRequest request) {
        Rubric rubric = rubricRepository.findById(rubricId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Rubric với ID: " + rubricId));

        if (!rubric.getStatus().equals(RubricStatus.PENDING)) {
            throw new RuntimeException("Chỉ có thể phê duyệt Rubric đang ở trạng thái Chờ duyệt (PENDING).");
        }

        if ("APPROVE".equalsIgnoreCase(request.getAction())) {
            rubric.setStatus(RubricStatus.APPROVED);
            rubric.setFeedback(null);
        } else if ("REJECT".equalsIgnoreCase(request.getAction())) {
            if (request.getFeedback() == null || request.getFeedback().trim().isEmpty()) {
                throw new IllegalArgumentException("Vui lòng nhập lý do từ chối để giảng viên chỉnh sửa.");
            }
            rubric.setStatus(RubricStatus.REJECTED);
            rubric.setFeedback(request.getFeedback());
        } else {
            throw new IllegalArgumentException("Hành động không hợp lệ. Chỉ chấp nhận APPROVE hoặc REJECT.");
        }

        rubric.setReviewedBy(reviewerId);
        rubric.setReviewedAt(LocalDateTime.now());


        // notificationClient.notifyRubricReviewed(rubric.getCreatedBy(), rubricId, request.getAction());

        return rubricRepository.save(rubric);
    }
}
