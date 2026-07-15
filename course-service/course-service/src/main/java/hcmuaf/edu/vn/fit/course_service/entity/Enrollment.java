package hcmuaf.edu.vn.fit.course_service.entity;
import hcmuaf.edu.vn.fit.course_service.entity.enums.EnrollmentStatus;
import hcmuaf.edu.vn.fit.course_service.entity.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "offering_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String enrollmentId;


    @Column(name = "student_id")
    private String studentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offering_id", nullable = false)
    private CourseOffering courseOffering;

    @Builder.Default
    private LocalDateTime enrollmentDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role = Role.STUDENT;

    private Float midtermScore;
    private Float finalScore;
    private Float totalScore;

    @Column(name = "attendance_score")
    private Float attendanceScore;

    @Column(name = "assignment_score")
    private Float assignmentScore;

    @Builder.Default
    @Column(name = "attendance_warning_count", nullable = false)
    private Integer attendanceWarningCount = 0;

    private String letterGrade;

    private LocalDateTime lastReadTime;
}
