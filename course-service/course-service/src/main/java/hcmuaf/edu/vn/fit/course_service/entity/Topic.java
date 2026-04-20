package hcmuaf.edu.vn.fit.course_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Topic {

    @Id
    @Column(name = "post_id", length = 50)
    private String id;

    @Column(name = "offering_id", nullable = false, length = 50)
    private String  offeringId;

    @Column(name = "user_id", nullable = false, length = 50)
    private String userId;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;



    @Column(name = "post_type", length = 50)
    private String postType;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}