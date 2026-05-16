package hcmuaf.edu.vn.fit.rubric_service.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "course_clo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseCloEntity {

    @Id
    @Column(name = "clo_id", nullable = false, length = 50)
    @GeneratedValue(strategy = GenerationType.UUID)
    private String cloId;

    @Column(name = "clo_code", nullable = false, unique = true, length = 20)
    private String cloCode;

    @Column(name = "clo_name", nullable = false, length = 255)
    private String cloName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "bloom_level", length = 50)
    private String bloomLevel;


    @OneToMany(mappedBy = "clo")
    @JsonManagedReference
    private List<CourseCloMapEntity> courseMappings;
}