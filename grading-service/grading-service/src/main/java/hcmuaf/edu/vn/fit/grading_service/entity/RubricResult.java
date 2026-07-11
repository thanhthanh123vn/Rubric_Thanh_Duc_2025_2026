package hcmuaf.edu.vn.fit.grading_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "rubric_results")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RubricResult {

    @Id
    @Column(name = "result_id", length = 50, nullable = false)
    private String resultId;

    @Column(name = "submission_id", length = 50)
    private String submissionId;

    @Column(name = "criteria_id", length = 50)
    private String criteriaId;

    @Column(name = "level_id", length = 50)
    private String levelId;

    @Column(name = "calculated_score")
    private Double calculatedScore;

    @Column(name = "lecturer_comment", columnDefinition = "text")
    private String lecturerComment;

    @Column(name = "graded_at")
    private LocalDateTime gradedAt;
}
