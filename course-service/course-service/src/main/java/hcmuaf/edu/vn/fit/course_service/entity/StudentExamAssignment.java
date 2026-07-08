package hcmuaf.edu.vn.fit.course_service.entity;

import hcmuaf.edu.vn.fit.course_service.entity.enums.StudentExamStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDateTime;

@Document(collection = "student_exam_assignments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentExamAssignment {

    @Id
    private String id;


    private String assessmentPaperId;


    private String studentId;

    private StudentExamStatus status;

    private Instant startTime;

    private Instant endTime;

    private Instant startedAt;

    private Instant submittedAt;
    private Double score;
}