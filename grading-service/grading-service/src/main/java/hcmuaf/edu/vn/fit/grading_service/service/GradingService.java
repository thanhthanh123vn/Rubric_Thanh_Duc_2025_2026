package hcmuaf.edu.vn.fit.grading_service.service;

import hcmuaf.edu.vn.fit.grading_service.RubricClient;
import hcmuaf.edu.vn.fit.grading_service.client.CourseClient;
import hcmuaf.edu.vn.fit.grading_service.client.NotificationClient;
import hcmuaf.edu.vn.fit.grading_service.dto.request.FeedbackTemplateRequest;
import hcmuaf.edu.vn.fit.grading_service.dto.response.FeedbackTemplateResponse;
import hcmuaf.edu.vn.fit.grading_service.entity.FeedbackTemplate;
import hcmuaf.edu.vn.fit.grading_service.dto.request.GradeRequest;
import hcmuaf.edu.vn.fit.grading_service.dto.request.SaveGradesRequest;
import hcmuaf.edu.vn.fit.grading_service.dto.request.StudentGradeDto;
import hcmuaf.edu.vn.fit.grading_service.dto.response.StudentCourseResponse;
import hcmuaf.edu.vn.fit.grading_service.entity.Grade;
import hcmuaf.edu.vn.fit.grading_service.repository.FeedbackTemplateRepository;
import hcmuaf.edu.vn.fit.grading_service.repository.GradeRepository;
import hcmuaf.edu.vn.fit.grading_service.entity.RubricResult;
import hcmuaf.edu.vn.fit.grading_service.repository.RubricResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@Slf4j
public class GradingService {


    private final GradeRepository repository;
    private final NotificationClient notificationClient;
    private final RubricClient rubricClient;
    private final CourseClient courseClient;

    private static final List<String> DEFAULT_FEEDBACK_TEMPLATES = List.of(
            "Cần bổ sung trích dẫn.",
            "Lập luận chưa chặt chẽ.",
            "Phân tích tốt.",
            "Cần làm rõ ví dụ minh họa.",
            "Trình bày rõ ràng, dễ theo dõi."
    );

    @Autowired
    private GradeRepository repository;
    private final FeedbackTemplateRepository feedbackTemplateRepository;
    private final RubricResultRepository rubricResultRepository;
    private final NotificationClient notificationClient;

    private Logger log;
    @Autowired
    private RubricClient rubricClient;

    public Grade gradeStudent(String studentId, String rubricId) {
        Map<String, Object> rubric = rubricClient.getRubric(rubricId);

        double totalScore = Math.random() * 10;

        Grade grade = new Grade();
        grade.setStudentId(studentId);
        grade.setRubricId(rubricId);
        grade.setTotalScore(totalScore);

        return repository.save(grade);
    }

    @Transactional
    public void processGrading(GradeRequest request) {
        Grade grade = repository.findByStudentIdAndAssessmentId(request.getStudentId(), request.getAssessmentId())
                .orElse(new Grade());

        grade.setSubmissionId(request.getSubmissionId());
        grade.setAssessmentId(request.getAssessmentId());
        grade.setStudentId(request.getStudentId());
        grade.setRubricId(request.getRubricId());
        grade.setTotalScore(request.getTotalScore());
        grade.setComment(request.getGeneralComment());
        grade.setStatus("GRADED");

        repository.save(grade);

        syncRubricResults(request);



        repository.save(grade);
    }

    public Long countGradedByAssessmentId(String assessmentId) {
        return repository.countByAssessmentId(assessmentId);
    }

    public Grade getGradeByStudentAndAssessmentId(String studentId, String assessmentId) {
        return repository.findByStudentIdAndAssessmentId(studentId, assessmentId).orElse(null);
    }


    public List<StudentGradeDto> getStudentsToGrade(String offeringId, String assessmentId) {
        log.info("Lấy danh sách chấm điểm cho assessmentId: {}", assessmentId);

        List<StudentCourseResponse> students = courseClient.getStudentsByOffering(offeringId);


        if (assessmentId == null || assessmentId.isBlank()) {
            return students.stream().map(student -> StudentGradeDto.builder()
                    .studentId(student.getStudentId())
                    .studentCode(student.getStudentId())
                    .studentName(student.getFullName())
                    .score(null)
                    .feedback("")
                    .build()
            ).collect(Collectors.toList());
        }

        List<Grade> existingGrades = repository.findByAssessmentId(assessmentId);
        Map<String, Grade> gradeMap = existingGrades.stream()
                .collect(Collectors.toMap(Grade::getStudentId, g -> g, (g1, g2) -> g1));

        return students.stream().map(student -> {
            Grade grade = gradeMap.get(student.getStudentId());
            return StudentGradeDto.builder()
                    .studentId(student.getStudentId())
                    .studentCode(student.getStudentId())
                    .studentName(student.getFullName())
                    .score(grade != null ? grade.getTotalScore() : null)
                    .feedback(grade != null && grade.getComment() != null ? grade.getComment() : "")
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public void saveGrades(SaveGradesRequest request) {
        log.info("Bắt đầu lưu điểm cho {} sinh viên, assessmentId: {}",
                request.getGrades().size(), request.getAssessmentId());
        if (request.getAssessmentId() == null || request.getAssessmentId().isBlank()) {
            throw new IllegalArgumentException("assessmentId is required");
        }
        for (StudentGradeDto dto : request.getGrades()) {
            if (dto.getScore() == null) continue;

            Grade grade = repository.findByStudentIdAndAssessmentId(dto.getStudentId(), request.getAssessmentId())
                    .orElse(new Grade());

            grade.setAssessmentId(request.getAssessmentId());
            grade.setStudentId(dto.getStudentId());
            grade.setTotalScore(dto.getScore());
            grade.setComment(dto.getFeedback());
            grade.setStatus("GRADED");

            repository.save(grade);
        }

        log.info("Lưu điểm thành công!");
    }
}

    @Transactional
    public List<FeedbackTemplateResponse> getFeedbackTemplates(String userId) {
        String normalizedUserId = normalizeUserId(userId);
        seedDefaultFeedbackTemplates(normalizedUserId);

        return feedbackTemplateRepository.findByUserIdOrderByUpdatedAtDescIdDesc(normalizedUserId)
                .stream()
                .map(this::toFeedbackTemplateResponse)
                .toList();
    }

    @Transactional
    public FeedbackTemplateResponse createFeedbackTemplate(FeedbackTemplateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request không được để trống");
        }

        String normalizedUserId = normalizeUserId(request.getUserId());
        String normalizedContent = normalizeContent(request.getContent());

        FeedbackTemplate template = feedbackTemplateRepository
                .findByUserIdAndContentIgnoreCase(normalizedUserId, normalizedContent)
                .orElseGet(() -> FeedbackTemplate.builder()
                        .userId(normalizedUserId)
                        .content(normalizedContent)
                        .build());

        template.setContent(normalizedContent);
        return toFeedbackTemplateResponse(feedbackTemplateRepository.save(template));
    }

    @Transactional
    public void deleteFeedbackTemplate(Long templateId, String userId) {
        if (templateId == null) {
            throw new IllegalArgumentException("templateId không được để trống");
        }

        String normalizedUserId = normalizeUserId(userId);
        FeedbackTemplate template = feedbackTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhận xét mẫu"));

        if (!normalizedUserId.equals(template.getUserId())) {
            throw new IllegalArgumentException("Bạn không có quyền xóa nhận xét mẫu này");
        }

        feedbackTemplateRepository.delete(template);
    }

    private void seedDefaultFeedbackTemplates(String userId) {
        if (!feedbackTemplateRepository.findByUserIdOrderByUpdatedAtDescIdDesc(userId).isEmpty()) {
            return;
        }

        List<FeedbackTemplate> defaults = DEFAULT_FEEDBACK_TEMPLATES.stream()
                .map(content -> FeedbackTemplate.builder()
                        .userId(userId)
                        .content(content)
                        .build())
                .toList();

        feedbackTemplateRepository.saveAll(defaults);
    }

    private String normalizeUserId(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("userId không được để trống");
        }
        return userId.trim();
    }

    private String normalizeContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung nhận xét mẫu không được để trống");
        }
        return content.trim();
    }

    private FeedbackTemplateResponse toFeedbackTemplateResponse(FeedbackTemplate template) {
        return FeedbackTemplateResponse.builder()
                .id(template.getId())
                .content(template.getContent())
                .build();
    }

    private void syncRubricResults(GradeRequest request) {
        if (request.getSubmissionId() == null || request.getSubmissionId().trim().isEmpty()) {
            return;
        }

        String submissionId = request.getSubmissionId().trim();
        rubricResultRepository.deleteBySubmissionId(submissionId);

        if (request.getCriteriaGrades() == null || request.getCriteriaGrades().isEmpty()) {
            return;
        }

        List<RubricResult> rubricResults = request.getCriteriaGrades().stream()
                .filter(criteriaGrade -> criteriaGrade.getCriteriaId() != null && !criteriaGrade.getCriteriaId().trim().isEmpty())
                .map(criteriaGrade -> RubricResult.builder()
                        .resultId(UUID.randomUUID().toString())
                        .submissionId(submissionId)
                        .criteriaId(criteriaGrade.getCriteriaId().trim())
                        .levelId(criteriaGrade.getLevelId() != null && !criteriaGrade.getLevelId().trim().isEmpty()
                                ? criteriaGrade.getLevelId().trim()
                                : null)
                        .calculatedScore(criteriaGrade.getScoreAchieved())
                        .lecturerComment(null)
                        .gradedAt(LocalDateTime.now())
                        .build())
                .toList();

        if (!rubricResults.isEmpty()) {
            rubricResultRepository.saveAll(rubricResults);
        }
    }
}

