package hcmuaf.edu.vn.fit.course_service.repository;



import hcmuaf.edu.vn.fit.course_service.entity.AssessmentComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface AssessmentCommentRepository extends JpaRepository<AssessmentComment, String> {

    List<AssessmentComment> findByAssessment_AssessmentIdOrderByCreatedAtAsc(String assessmentId);
    @Modifying
    @Transactional
    void deleteByAssessment_AssessmentId(String assessmentId);
}