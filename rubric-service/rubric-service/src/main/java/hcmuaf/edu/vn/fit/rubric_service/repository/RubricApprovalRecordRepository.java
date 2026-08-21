package hcmuaf.edu.vn.fit.rubric_service.repository;

import hcmuaf.edu.vn.fit.rubric_service.entity.RubricApprovalRecord;
import hcmuaf.edu.vn.fit.rubric_service.entity.enums.ApprovalRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RubricApprovalRecordRepository extends JpaRepository<RubricApprovalRecord, String> {
    Optional<RubricApprovalRecord> findTopByRubricIdOrderByRevisionNumberDesc(String rubricId);

    List<RubricApprovalRecord> findByStatusOrderByRequestedAtAsc(ApprovalRequestStatus status);
}
