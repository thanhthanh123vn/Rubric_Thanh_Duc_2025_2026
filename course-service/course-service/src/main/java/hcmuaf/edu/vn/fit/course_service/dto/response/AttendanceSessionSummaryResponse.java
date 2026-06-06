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
public class AttendanceSessionSummaryResponse {
    private String sessionId;
    private String offeringId;
    private LocalDate attendanceDate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private long checkedInCount;
}
