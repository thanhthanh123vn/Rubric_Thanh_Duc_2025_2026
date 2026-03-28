package hcmuaf.edu.vn.fit.rubric_service.entity;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Level {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private double score;
}