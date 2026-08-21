package hcmuaf.edu.vn.fit.rubric_service.entity;

import hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricStatus;
import hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricType;
import hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricVisibility;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "rubrics")
@NoArgsConstructor
@AllArgsConstructor

@Builder
@Getter
@Setter
public class Rubric {

    @Id
    @Column(name = "rubric_id", length = 50)
    private String rubricId;

    @Column(name = "lecturer_id", length = 50)
    private String lecturerId;
    private String courseId;
    @Column(name = "faculty_id", length = 50)
    private String facultyId;
    @Enumerated(EnumType.STRING)
    @Column(name = "rubric_type", nullable = false)
    @Builder.Default
    private RubricType rubricType = RubricType.FACULTY;
    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false)
    @Builder.Default
    private RubricVisibility visibility = RubricVisibility.FACULTY;
    @Column(name = "root_rubric_id", length = 50)
    private String rootRubricId;
    @Column(name = "parent_rubric_id", length = 50)
    private String parentRubricId;
    @Column(name = "version_number", nullable = false)
    @Builder.Default
    private Integer versionNumber = 1;
    private String createdBy;
    @Column(name = "rubric_name", length = 255)
    private String rubricName;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RubricStatus status = RubricStatus.DRAFT;
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    @Column(columnDefinition = "TEXT")
    private String feedback;
    private LocalDateTime submittedAt;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    @OneToMany(mappedBy = "rubric", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<RubricCriteria> criteria;
}
