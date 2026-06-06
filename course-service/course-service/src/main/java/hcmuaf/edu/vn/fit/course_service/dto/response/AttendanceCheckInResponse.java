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
public class AttendanceCheckInResponse {
    private String attendanceId;
    private String sessionId;
    private String offeringId;
    private String studentId;
    private String status;
    private String method;
    private LocalDate studyDate;
    private LocalDateTime checkinTime;
    private String note;
    private String message;
}
