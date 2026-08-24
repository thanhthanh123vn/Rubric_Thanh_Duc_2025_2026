package hcmuaf.edu.vn.fit.rubric_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "course_clo",
        catalog = "db_course",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_course_clo_course_code",
                columnNames = {"course_id", "clo_code"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseCloEntity {

    @Id
    @Column(name = "clo_id", nullable = false, length = 50)
    @GeneratedValue(strategy = GenerationType.UUID)
    private String cloId;

    @Column(name = "course_id", nullable = false, length = 50)
    private String courseId;

    @Column(name = "clo_code", nullable = false, length = 20)
    private String cloCode;

    @Column(name = "clo_name", nullable = false, length = 255)
    private String cloName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "bloom_level", length = 50)
    private String bloomLevel;

    @Column(name = "approval_status", nullable = false, length = 30)
    @Builder.Default
    private String approvalStatus = "DRAFT";

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
