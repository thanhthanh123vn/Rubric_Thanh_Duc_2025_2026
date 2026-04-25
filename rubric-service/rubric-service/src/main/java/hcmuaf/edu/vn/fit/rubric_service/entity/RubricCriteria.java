package hcmuaf.edu.vn.fit.rubric_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "rubric_criteria")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RubricCriteria {

    @Id
    @Column(name = "criteria_id", length = 50)
    private String criteriaId;


    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rubric_id")
    private Rubric rubric;
    @Column(name = "clo_id", length = 50)
    private String cloId;


    @Column(name = "criteria_name", length = 255)
    private String criteriaName;

    @Column(name = "weight")
    private Float weight;


    @OneToMany(mappedBy = "criteria", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RubricLevel> levels;
}