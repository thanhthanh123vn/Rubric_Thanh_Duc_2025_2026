package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.entity.AssessmentCLO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface AssessmentCLORepository extends JpaRepository<AssessmentCLO, String> {
    @Transactional
    void deleteByAssessment_AssessmentId(String assessmentId);
}