package hcmuaf.edu.vn.fit.grading_service.service;
import ch.qos.logback.classic.Logger;
import hcmuaf.edu.vn.fit.grading_service.RubricClient;
import hcmuaf.edu.vn.fit.grading_service.client.NotificationClient;
import hcmuaf.edu.vn.fit.grading_service.dto.request.FeedbackTemplateRequest;
import hcmuaf.edu.vn.fit.grading_service.dto.response.FeedbackTemplateResponse;
import hcmuaf.edu.vn.fit.grading_service.entity.FeedbackTemplate;
import hcmuaf.edu.vn.fit.grading_service.dto.request.GradeRequest;
import hcmuaf.edu.vn.fit.grading_service.dto.request.NotificationRequest;
import hcmuaf.edu.vn.fit.grading_service.entity.Grade;
import hcmuaf.edu.vn.fit.grading_service.repository.FeedbackTemplateRepository;
import hcmuaf.edu.vn.fit.grading_service.repository.GradeRepository;
import hcmuaf.edu.vn.fit.grading_service.entity.RubricResult;
import hcmuaf.edu.vn.fit.grading_service.repository.RubricResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GradingService {

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

        // gọi rubric-service
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



    }
//    public Grade saveRubricGrade(GradeRequest request) {
//        // Tìm xem đã chấm điểm bài này chưa, nếu rồi thì ghi đè (Cập nhật), chưa thì tạo mới
//        Grade grade = repository.findByStudentIdAndAssessmentId(request.getStudentId(), request.getAssessmentId())
//                .orElse(new Grade());
//
//        grade.setStudentId(request.getStudentId());
//        grade.(request.getAssessmentId());
//        grade.setRubricId(request.getRubricId());
//        grade.setCriteriaScores(request.getScores());
//        grade.setTotalScore(request.getTotalScore());
//
//        return repository.save(grade);
//    }

    public Long countGradedByAssessmentId(String assessmentId) {
        // Giả sử bạn có repository để query DB
        return repository.countByAssessmentId(assessmentId);
    }

    public Grade getGradeByStudentAndAssessmentId(String studentId, String assessmentId) {
        return repository.findByStudentIdAndAssessmentId(studentId, assessmentId).orElse(null);
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
