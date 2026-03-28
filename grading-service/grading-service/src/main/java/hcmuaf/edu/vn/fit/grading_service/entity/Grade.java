package hcmuaf.edu.vn.fit.grading_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;
    private Long rubricId;

    private double totalScore;
}