package hcmuaf.edu.vn.fit.course_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name="submissions")
@AllArgsConstructor
@NoArgsConstructor
@Getter @Setter
public class SubmissionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "submission_id")
    private String id;

    @Column(name = "assessment_id")
    private String assessmentId;
    @Column(name = "student_id")
    private String studentId;
    @Column(name = "file_url")
    private String fileUrl;
//    private String link;
//
//    private Double score;
//    private String lecturerComment;
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
}
