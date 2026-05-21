package hcmuaf.edu.vn.fit.grading_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String grade;
    private String submissionId;
    private String assessmentId;
    private String comment;

    private String studentId;
    private String rubricId;
    private String status;

    private double totalScore;

}