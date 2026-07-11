package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceStudentOverviewResponse {
    private String studentId;
    private String studentName;
    private String email;
    private int totalSessions;
    private int presentCount;
    private int absentCount;
    private String resultStatus;
    private List<AttendanceOverviewDateResponse> attendanceDates;
}
