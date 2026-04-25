package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.entity.AssessmentCLO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface AssessmentCLORepository extends JpaRepository<AssessmentCLO, String> {
    @Modifying
    @Transactional
    @Query("DELETE FROM AssessmentCLO a WHERE a.assessment.assessmentId = :assessmentId")
    void deleteByAssessment_AssessmentId(@Param("assessmentId") String assessmentId);
}