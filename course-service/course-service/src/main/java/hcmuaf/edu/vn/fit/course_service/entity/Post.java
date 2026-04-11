package hcmuaf.edu.vn.fit.course_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.sql.Timestamp;

@Entity
@Table(name = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @Column(name = "post_id", length = 50)
    private String postId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offering_id")
    private CourseOffering courseOffering;


    @Column(name = "user_id", length = 50)
    private String userId;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "post_type", length = 50)
    private String postType;

    @Column(name = "is_pinned")
    @Builder.Default
    private Boolean isPinned = false;

    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());
}