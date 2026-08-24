package hcmuaf.edu.vn.fit.rubric_service.repository;

import hcmuaf.edu.vn.fit.rubric_service.entity.CloPloWorkflowEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CloPloWorkflowRepository extends JpaRepository<CloPloWorkflowEntity, String> {
    Optional<CloPloWorkflowEntity> findByCourseIdAndSubmissionType(String courseId, String submissionType);
}
