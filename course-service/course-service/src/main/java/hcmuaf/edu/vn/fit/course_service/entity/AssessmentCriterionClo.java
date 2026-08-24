package hcmuaf.edu.vn.fit.course_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "assessment_criterion_clo",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_assessment_criterion_clo",
                columnNames = {"assessment_id", "criteria_id", "clo_id"}
        )
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentCriterionClo {
    @Id
    @Column(name = "mapping_id", length = 100,
            columnDefinition = "varchar(100) COLLATE utf8mb4_unicode_520_ci")
    private String mappingId;

    @Column(name = "assessment_id", nullable = false, length = 50,
            columnDefinition = "varchar(50) COLLATE utf8mb4_unicode_520_ci")
    private String assessmentId;

    @Column(name = "criteria_id", nullable = false, length = 50,
            columnDefinition = "varchar(50) COLLATE utf8mb4_unicode_520_ci")
    private String criteriaId;

    @Column(name = "clo_id", nullable = false, length = 50,
            columnDefinition = "varchar(50) COLLATE utf8mb4_unicode_520_ci")
    private String cloId;
}
