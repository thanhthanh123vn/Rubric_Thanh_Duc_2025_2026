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

    // Liên kết với lớp học đang mở (CourseOffering)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offering_id", nullable = false)
    private CourseOffering courseOffering;

    @Column(name = "room", length = 100)
    private String room;

    // Loại sự kiện: lecture (lý thuyết), seminar, lab (thực hành)...
    @Column(name = "class_type", length = 50)
    private String classType;

    // Ngày trong tuần: 0 = Thứ 2 (MON), 1 = Thứ 3 (TUE), ..., 6 = Chủ Nhật (SUN)
    // Tương ứng với biến 'day' trên Frontend
    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek;

    // Thời gian bắt đầu (vd: 08:30:00)
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    // Thời gian kết thúc (vd: 10:00:00)
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    // Lưu mã màu hoặc chuỗi css color (tuỳ chọn)
    // Vd: "bg-blue-100 border-blue-500 text-blue-700"
    @Column(name = "color_theme", length = 100)
    private String colorTheme;
}