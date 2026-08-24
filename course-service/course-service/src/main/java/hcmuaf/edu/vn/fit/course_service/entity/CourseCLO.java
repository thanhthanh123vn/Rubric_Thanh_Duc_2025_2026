package hcmuaf.edu.vn.fit.course_service.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_clo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseCLO {

    @Id
    @Column(name = "clo_id", length = 50)
    private String cloId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    @JsonIgnore
    private Course course;

    @Column(name = "clo_code", length = 20)
    private String cloCode;

    @Column(name = "clo_name", length = 255)
    private String cloName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "bloom_level", length = 50)
    private String bloomLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false, length = 30)
    @Builder.Default
    private CloPloApprovalStatus approvalStatus = CloPloApprovalStatus.DRAFT;

    @Column(name = "submitted_by", length = 50)
    private String submittedBy;

    @Column(name = "submitted_by_name", length = 255)
    private String submittedByName;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "reviewed_by", length = 50)
    private String reviewedBy;

    @Column(name = "reviewed_by_name", length = 255)
    private String reviewedByName;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
}
