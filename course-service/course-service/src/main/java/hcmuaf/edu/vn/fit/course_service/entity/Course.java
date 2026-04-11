package hcmuaf.edu.vn.fit.course_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @Column(name = "course_id", length = 50)
    private String courseId;

    @Column(name = "course_code", length = 20, nullable = false, unique = true)
    private String courseCode;

    @Column(name = "course_name", length = 255, nullable = false)
    private String courseName;

    @Column(name = "credits", nullable = false)
    private Integer credits;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "department", length = 100)
    private String department;
}