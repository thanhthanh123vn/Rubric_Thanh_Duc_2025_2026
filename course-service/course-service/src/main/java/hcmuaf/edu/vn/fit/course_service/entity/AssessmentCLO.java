package hcmuaf.edu.vn.fit.course_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "assessment_clo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentCLO {

    @Id
    @Column(name = "assessment_clo_id", length = 50)
    private String assessmentCloId;


    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id")
    private Assessment assessment;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clo_id")
    private CourseCLO courseCLO;
}