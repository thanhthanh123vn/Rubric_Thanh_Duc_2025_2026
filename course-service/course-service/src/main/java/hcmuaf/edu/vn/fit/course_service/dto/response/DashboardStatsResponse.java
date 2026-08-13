package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsResponse {
    private long enrolledCoursesCount;
    private double averageProgress;
    private long rubricsCount;
}