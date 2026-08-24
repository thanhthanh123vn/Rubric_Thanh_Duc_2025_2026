package hcmuaf.edu.vn.fit.course_service.repository.jpa;

import hcmuaf.edu.vn.fit.course_service.entity.AssignmentProposalStatus;
import hcmuaf.edu.vn.fit.course_service.entity.TeachingAssignmentProposal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeachingAssignmentProposalRepository extends JpaRepository<TeachingAssignmentProposal, String> {
    List<TeachingAssignmentProposal> findAllByOrderByCreatedAtDesc();
    List<TeachingAssignmentProposal> findByStatusOrderByCreatedAtDesc(AssignmentProposalStatus status);
    List<TeachingAssignmentProposal> findByRequestedByOrderByCreatedAtDesc(String requestedBy);
    Optional<TeachingAssignmentProposal> findFirstByOfferingIdAndStatusOrderByCreatedAtDesc(
            String offeringId,
            AssignmentProposalStatus status
    );
}
