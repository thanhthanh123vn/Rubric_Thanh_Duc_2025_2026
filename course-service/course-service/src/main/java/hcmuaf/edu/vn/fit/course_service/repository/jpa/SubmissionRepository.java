package hcmuaf.edu.vn.fit.course_service.repository.jpa;

import hcmuaf.edu.vn.fit.course_service.entity.SubmissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<SubmissionEntity, String> {
    Optional<SubmissionEntity> findByAssessmentIdAndStudentId(String assessmentId, String studentId);


    @Modifying
    @Transactional
    @Query("DELETE FROM SubmissionEntity s WHERE s.assessmentId = :assessmentId")
    void deleteByAssessmentId(@Param("assessmentId") String assessmentId);

    List<SubmissionEntity> findByAssessmentId(String assessmentId);

    List<SubmissionEntity> findTop5ByOrderBySubmittedAtDesc();
    Optional<SubmissionEntity> findTopByAssessmentIdAndStudentIdOrderBySubmittedAtDesc(String assessmentId, String studentId);
    Long countByAssessmentId(String assessmentId);
}