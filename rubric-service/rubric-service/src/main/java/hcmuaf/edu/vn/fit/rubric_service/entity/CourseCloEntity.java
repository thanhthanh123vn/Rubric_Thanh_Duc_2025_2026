package hcmuaf.edu.vn.fit.rubric_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "course_clo",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_course_clo_course_code",
                columnNames = {"course_id", "clo_code"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseCloEntity {

    @Id
    @Column(name = "clo_id", nullable = false, length = 50)
    @GeneratedValue(strategy = GenerationType.UUID)
    private String cloId;

    @Column(name = "course_id", nullable = false, length = 50)
    private String courseId;

    @Column(name = "clo_code", nullable = false, length = 20)
    private String cloCode;

    @Column(name = "clo_name", nullable = false, length = 255)
    private String cloName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "bloom_level", length = 50)
    private String bloomLevel;
}
