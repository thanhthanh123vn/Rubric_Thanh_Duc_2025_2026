package hcmuaf.edu.vn.fit.course_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Table(name = "course_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "schedule_id", length = 50)
    private String scheduleId;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offering_id", nullable = false)
    private CourseOffering courseOffering;

    @Column(name = "room", length = 100)
    private String room;


    @Column(name = "class_type", length = 50)
    private String classType;


    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek;


    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;


    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;


    @Column(name = "color_theme", length = 100)
    private String colorTheme;
}