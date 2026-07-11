package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceOverviewDateResponse {
    private String sessionId;
    private String attendanceId;
    private LocalDate attendanceDate;
    private String status;
    private String category;
    private String displayText;
    private String note;
    private String colorHex;
    private String legendLabel;
}
