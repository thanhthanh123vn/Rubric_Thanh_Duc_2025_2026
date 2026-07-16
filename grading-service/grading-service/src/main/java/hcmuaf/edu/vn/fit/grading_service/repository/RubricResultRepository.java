package hcmuaf.edu.vn.fit.grading_service.repository;

import hcmuaf.edu.vn.fit.grading_service.entity.RubricResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RubricResultRepository extends JpaRepository<RubricResult, String> {
    void deleteBySubmissionId(String submissionId);
}
