package hcmuaf.edu.vn.fit.course_service.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "course_clo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseCLO {

    @Id
    @Column(name = "clo_id", length = 50)
    private String cloId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(name = "clo_code", length = 20)
    private String cloCode;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "bloom_level", length = 50)
    private String bloomLevel;
}