package hcmuaf.edu.vn.fit.course_service.dto.request;

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
public class CreateAttendanceSessionRequest {
    private String offeringId;
    private LocalDate attendanceDate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
