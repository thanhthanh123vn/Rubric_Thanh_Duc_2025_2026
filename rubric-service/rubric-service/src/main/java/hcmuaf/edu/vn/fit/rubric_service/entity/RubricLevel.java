package hcmuaf.edu.vn.fit.rubric_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rubric_levels")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RubricLevel {

    @Id
    @Column(name = "level_id", length = 50)
    private String levelId;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "criteria_id")
    private RubricCriteria criteria;

    @Column(name = "level_name", length = 100)
    private String levelName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "score")
    private Float score;
}