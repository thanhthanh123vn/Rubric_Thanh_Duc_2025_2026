package hcmuaf.edu.vn.fit.rubric_service.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
public class Criterion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private double weight;

    @OneToMany(cascade = CascadeType.ALL)
    private List<Level> levels;
}