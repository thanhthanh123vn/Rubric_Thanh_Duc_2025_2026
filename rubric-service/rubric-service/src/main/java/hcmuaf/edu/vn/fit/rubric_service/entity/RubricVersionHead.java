package hcmuaf.edu.vn.fit.rubric_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "rubric_version_heads",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_rubric_head_root_lecturer",
                columnNames = {"root_rubric_id", "lecturer_id"}
        )
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RubricVersionHead {
    @Id
    @Column(name = "head_id", length = 50)
    private String headId;

    @Column(name = "root_rubric_id", nullable = false, length = 50)
    private String rootRubricId;

    @Column(name = "lecturer_id", nullable = false, length = 50)
    private String lecturerId;

    @Column(name = "rubric_id", nullable = false, length = 50)
    private String rubricId;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    void updateTimestamp() {
        updatedAt = LocalDateTime.now();
    }
}
