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
    private String note;
}
