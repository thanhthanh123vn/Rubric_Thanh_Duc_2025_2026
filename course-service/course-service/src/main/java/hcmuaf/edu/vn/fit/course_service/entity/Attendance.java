package hcmuaf.edu.vn.fit.course_service.entity;

import hcmuaf.edu.vn.fit.course_service.entity.enums.AttendanceMethod;
import hcmuaf.edu.vn.fit.course_service.entity.enums.AttendanceStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "attendance",
        uniqueConstraints = @UniqueConstraint(name = "uq_attendance", columnNames = {"session_id", "student_id"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {

    @Id
    @Column(name = "attendance_id", length = 50, nullable = false)
    private String attendanceId;

    @Column(name = "session_id", length = 50, nullable = false)
    private String sessionId;

    @Column(name = "student_id", length = 50, nullable = false)
    private String studentId;

    @Column(name = "offering_id", length = 50, nullable = false)
    private String offeringId;

    @Column(name = "study_date", nullable = false)
    private LocalDate studyDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private AttendanceStatus status;

    @Column(name = "checkin_time")
    private LocalDateTime checkinTime;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "distance")
    private Double distance;

    @Column(name = "browser_id", length = 120)
    private String browserId;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "ip_address", length = 100)
    private String ipAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "method", length = 20)
    private AttendanceMethod method;

    @Column(name = "note", length = 255)
    private String note;

    @PrePersist
    void prePersist() {
        if (attendanceId == null || attendanceId.isBlank()) {
            attendanceId = "AT-" + UUID.randomUUID().toString().replace("-", "");
        }
    }
}
