package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceStudentResponse {
    private String attendanceId;
    private String sessionId;
    private String studentId;
    private String studentName;
    private String email;
    private String status;
    private String method;
    private LocalDateTime checkinTime;
    private Double latitude;
    private Double longitude;
    private Double distance;
    private Double sessionRadius;
    private String browserId;
    private String userAgent;
    private String ipAddress;
    private Boolean suspicious;
    private String suspiciousReason;
    private String note;
}
