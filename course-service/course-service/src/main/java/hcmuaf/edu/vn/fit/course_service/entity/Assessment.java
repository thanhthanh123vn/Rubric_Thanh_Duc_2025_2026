package hcmuaf.edu.vn.fit.course_service.entity;
import jakarta.persistence.*;
import lombok.*;
import java.sql.Timestamp;

@Entity
@Table(name = "assessments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assessment {

    @Id
    @Column(name = "assessment_id", length = 50)
    private String assessmentId;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offering_id")
    private CourseOffering courseOffering;


    @Column(name = "rubric_id", length = 50)
    private String rubricId;

    @Column(name = "assessment_name", length = 255)
    private String assessmentName;

    @Column(name = "assessment_type", length = 100)
    private String assessmentType;

    @Column(name = "weight")
    private Float weight;

    @Column(name = "start_time", nullable = false, updatable = false)
    @Builder.Default
    private Timestamp startTime = new Timestamp(System.currentTimeMillis());

    @Column(name = "end_time")
    private Timestamp endTime;
}