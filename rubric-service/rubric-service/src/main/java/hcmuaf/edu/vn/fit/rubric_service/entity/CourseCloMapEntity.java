package hcmuaf.edu.vn.fit.rubric_service.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "course_clo_map",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"course_id", "clo_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseCloMapEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_id", nullable = false)
    private String courseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "clo_id",
            referencedColumnName = "clo_id",
            nullable = false
    )
    @JsonBackReference
    private CourseCloEntity clo;
}