package hcmuaf.edu.vn.fit.course_service.repository.jpa;

import hcmuaf.edu.vn.fit.course_service.entity.CloPloApprovalStatus;
import hcmuaf.edu.vn.fit.course_service.entity.CloPloSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CloPloSubmissionRepository extends JpaRepository<CloPloSubmission, String> {
    Optional<CloPloSubmission> findByCourseIdAndSubmissionType(
            String courseId, hcmuaf.edu.vn.fit.course_service.entity.CloPloSubmissionType submissionType);
    List<CloPloSubmission> findByStatusAndCourseIdInOrderBySubmittedAtDesc(
            CloPloApprovalStatus status, Collection<String> courseIds);
}
