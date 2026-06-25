package hcmuaf.edu.vn.fit.rubric_service.entity;

import hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricStatus;
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
    private String createdBy;
    @Column(name = "rubric_name", length = 255)
    private String rubricName;
    @Enumerated(EnumType.STRING)
    private RubricStatus status = RubricStatus.DRAFT;
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    @Column(columnDefinition = "TEXT")
    private String feedback;

    @OneToMany(mappedBy = "rubric", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<RubricCriteria> criteria;
}
