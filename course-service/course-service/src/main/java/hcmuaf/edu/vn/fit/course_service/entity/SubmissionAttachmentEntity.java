package hcmuaf.edu.vn.fit.course_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "submission_attachments")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class SubmissionAttachmentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "attachment_id")
    private String id;

    @Column(name = "submission_id", nullable = false)
    private String submissionId;

    @Column(name = "attachment_type", nullable = false, length = 20)
    private String attachmentType;

    @Column(name = "attachment_url", nullable = false, length = 1000)
    private String attachmentUrl;

    @Column(name = "original_name", length = 255)
    private String originalName;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
