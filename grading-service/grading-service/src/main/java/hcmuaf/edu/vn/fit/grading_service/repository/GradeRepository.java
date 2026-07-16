package hcmuaf.edu.vn.fit.grading_service.repository;
import hcmuaf.edu.vn.fit.grading_service.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GradeRepository extends JpaRepository<Grade, Long> {
    Optional<Grade> findByStudentIdAndAssessmentId(String studentId, String assessmentId);
    Optional<Grade> findByStudentId(String studentId);

    Long countByAssessmentId(String assessmentId);

    List<Grade> findByAssessmentId(String assessmentId);
//    Optional<Grade> findByStudentIdAndExamId(String studentId, String examId);


//    List<Grade> findByExamId(String examId);

}