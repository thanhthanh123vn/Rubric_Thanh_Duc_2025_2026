package hcmuaf.edu.vn.fit.course_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "syllabus_files")
@Data
public class SyllabusFile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String fileName;

    private String fileUrl;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;
}