package hcmuaf.edu.vn.fit.rubric_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "rubrics")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class Rubric {

    @Id
    @Column(name = "rubric_id", length = 50)
    private String rubricId;

    @Column(name = "lecturer_id", length = 50) // ID Giảng viên tạo Rubric này
    private String lecturerId;

    @Column(name = "rubric_name", length = 255)
    private String rubricName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;


    @OneToMany(mappedBy = "rubric", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<RubricCriteria> criteria;
}
