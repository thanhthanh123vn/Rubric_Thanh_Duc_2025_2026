package hcmuaf.edu.vn.fit.rubric_service.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "rubrics")
public class Rubric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_id")
    private Long courseId;

    // Ánh xạ dữ liệu JSON trực tiếp vào MySQL
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "rubric_structure", columnDefinition = "json")
    private String rubricStructure;


}