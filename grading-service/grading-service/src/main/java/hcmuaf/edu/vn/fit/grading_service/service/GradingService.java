package hcmuaf.edu.vn.fit.grading_service.service;
import ch.qos.logback.classic.Logger;
import hcmuaf.edu.vn.fit.grading_service.RubricClient;
import hcmuaf.edu.vn.fit.grading_service.client.NotificationClient;
import hcmuaf.edu.vn.fit.grading_service.dto.request.GradeRequest;
import hcmuaf.edu.vn.fit.grading_service.dto.request.NotificationRequest;
import hcmuaf.edu.vn.fit.grading_service.entity.Grade;
import hcmuaf.edu.vn.fit.grading_service.repository.GradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class GradingService {

    @Autowired
    private GradeRepository repository;
   private final NotificationClient notificationClient;

    private     Logger log;
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
        grade.setStudentId(request.getStudentId());
        grade.setTotalScore(request.getTotalScore());
        grade.setComment(request.getGeneralComment());
        grade.setStatus("GRADED");
        repository.save(grade);



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
}