package hcmuaf.edu.vn.fit.rubric_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "course_clo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseCloEntity {

    @Id
    @Column(name = "clo_id")
    @GeneratedValue(strategy = GenerationType.UUID)
    private String cloId;

    @Column(name = "clo_name")
    private String cloName;

    @Column(name = "clo_code")
    private String cloCode;

    @Column(name = "course_id")
    private String courseId;

    @Column(name = "description")
    private String description;

    @Column(name = "bloom_level")
    private String bloomLevel;
}