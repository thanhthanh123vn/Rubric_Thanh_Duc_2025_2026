package hcmuaf.edu.vn.fit.course_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.sql.Timestamp;

@Entity
@Table(name = "assessment_comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentComment {

    @Id
    @Column(name = "comment_id", length = 50)
    private String commentId;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @Column(name = "user_id", length = 50)
    private String userId;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());
}