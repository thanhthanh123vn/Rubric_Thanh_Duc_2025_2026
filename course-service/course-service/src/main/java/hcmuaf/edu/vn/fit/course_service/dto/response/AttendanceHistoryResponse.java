package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceHistoryResponse {
    private String attendanceId;
    private String sessionId;
    private LocalDate studyDate;
    private String status;
    private String method;
    private LocalDateTime checkinTime;
    private String note;
}
