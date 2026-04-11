package hcmuaf.edu.vn.fit.course_service.entity;
import jakarta.persistence.*;
import lombok.*;
import java.sql.Timestamp;

@Entity
@Table(name = "enrollments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @Column(name = "enrollment_id", length = 50)
    private String enrollmentId;


    @Column(name = "student_id", length = 50, nullable = false)
    private String studentId;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offering_id", nullable = false)
    private CourseOffering courseOffering;

    @Column(name = "enrollment_date", nullable = false, updatable = false)
    @Builder.Default
    private Timestamp enrollmentDate = new Timestamp(System.currentTimeMillis());

    @Column(name = "status", length = 50)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "midterm_score")
    private Float midtermScore;

    @Column(name = "final_score")
    private Float finalScore;

    @Column(name = "total_score")
    private Float totalScore;

    @Column(name = "letter_grade", length = 5)
    private String letterGrade;
}