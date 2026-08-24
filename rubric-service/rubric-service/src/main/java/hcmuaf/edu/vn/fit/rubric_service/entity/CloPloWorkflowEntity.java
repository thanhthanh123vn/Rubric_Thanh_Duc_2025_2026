package hcmuaf.edu.vn.fit.rubric_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "clo_plo_submissions", catalog = "db_course")
@Getter
@Setter
public class CloPloWorkflowEntity {
    @Id
    @Column(name = "submission_id", length = 64)
    private String submissionId;

    @Column(name = "course_id", length = 50)
    private String courseId;

    @Column(name = "submission_type", length = 30)
    private String submissionType;

    @Column(name = "status", length = 30)
    private String status;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
}
