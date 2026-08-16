package hcmuaf.edu.vn.fit.rubric_service.entity;

import hcmuaf.edu.vn.fit.rubric_service.entity.enums.ApprovalRequestStatus;
import hcmuaf.edu.vn.fit.rubric_service.entity.enums.ApprovalReviewerRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "rubric_approval_requests",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_rubric_approval_revision",
                columnNames = {"rubric_id", "revision_number"}
        )
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RubricApprovalRecord {

    @Id
    @Column(name = "approval_request_id", length = 64)
    private String approvalRequestId;

    @Column(name = "rubric_id", nullable = false, length = 50)
    private String rubricId;

    @Column(name = "revision_number", nullable = false)
    private Integer revisionNumber;

    @Column(name = "submitted_by", nullable = false, length = 50)
    private String submittedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "required_reviewer_role", nullable = false, length = 20)
    @Builder.Default
    private ApprovalReviewerRole requiredReviewerRole = ApprovalReviewerRole.DEAN;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ApprovalRequestStatus status = ApprovalRequestStatus.PENDING;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "reviewed_by", length = 50)
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    @PrePersist
    protected void onCreate() {
        if (requestedAt == null) {
            requestedAt = LocalDateTime.now();
        }
        if (revisionNumber == null) {
            revisionNumber = 1;
        }
    }
}
