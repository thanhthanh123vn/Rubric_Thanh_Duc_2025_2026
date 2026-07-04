package hcmuaf.edu.vn.fit.course_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "course_offerings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseOffering {

    @Id
    @Column(name = "offering_id", length = 50)
    private String offeringId;
    @Column(name="offering_name",length = 255)
    private String offeringName;



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;


    @Column(name = "lecturer_id")
    private String lecturerId;
    @Column(name = "semester", length = 50)
    private String semester;

    @Column(name = "academic_year", length = 20)
    private String academicYear;

    @Column(name = "max_students")
    private Integer maxStudents;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "status", length = 50)
    @Builder.Default
    private String status = "OPEN";


    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "course_offering_lecturers",
            joinColumns = @JoinColumn(name = "offering_id")
    )
    @Column(name = "lecturer_id")
    private List<String> lecturerIds = new ArrayList<>();
}