package hcmuaf.edu.vn.fit.grading_service.repository;
import hcmuaf.edu.vn.fit.grading_service.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GradeRepository extends JpaRepository<Grade, Long> {
    Optional<Grade> findByStudentIdAndAssessmentId(String studentId, String assessmentId);

    Long countByAssessmentId(String assessmentId);
}