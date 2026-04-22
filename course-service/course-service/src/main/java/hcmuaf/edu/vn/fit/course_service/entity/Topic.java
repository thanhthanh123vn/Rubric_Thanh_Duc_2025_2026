package hcmuaf.edu.vn.fit.course_service.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "posts")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Topic  {

    @Id
    @Column(name = "post_id", length = 50)
    private String postId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offering_id")
    private CourseOffering courseOffering;


    @Column(name = "user_id")
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

    @Column(name = "created_at")
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at")
    @LastModifiedDate
    private Instant updatedAt;

}