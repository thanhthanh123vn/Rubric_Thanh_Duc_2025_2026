package hcmuaf.edu.vn.fit.grading_service.service;

import hcmuaf.edu.vn.fit.grading_service.RubricClient;
import hcmuaf.edu.vn.fit.grading_service.client.CourseClient;
import hcmuaf.edu.vn.fit.grading_service.client.NotificationClient;
import hcmuaf.edu.vn.fit.grading_service.dto.request.GradeRequest;
import hcmuaf.edu.vn.fit.grading_service.dto.request.SaveGradesRequest;
import hcmuaf.edu.vn.fit.grading_service.dto.request.StudentGradeDto;
import hcmuaf.edu.vn.fit.grading_service.dto.response.StudentCourseResponse;
import hcmuaf.edu.vn.fit.grading_service.entity.Grade;
import hcmuaf.edu.vn.fit.grading_service.repository.GradeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GradingService {

    private final GradeRepository repository;
    private final NotificationClient notificationClient;
    private final RubricClient rubricClient;
    private final CourseClient courseClient;

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