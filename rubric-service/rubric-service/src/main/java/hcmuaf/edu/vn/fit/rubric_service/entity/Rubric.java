package hcmuaf.edu.vn.fit.rubric_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "rubrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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


    @OneToMany(mappedBy = "rubric", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RubricCriteria> criteria;
}