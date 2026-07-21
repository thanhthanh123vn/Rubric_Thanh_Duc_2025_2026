package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OverviewReportResponse {
    private long totalCourses;
    private long totalOfferings;
    private long totalStudents;
    private double avgFinalScore;
    private double passRate; // 0..1
    private double failRate; // 0..1
}