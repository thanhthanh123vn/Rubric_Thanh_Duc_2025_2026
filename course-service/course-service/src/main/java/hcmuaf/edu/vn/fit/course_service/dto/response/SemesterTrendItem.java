package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SemesterTrendItem {
    private String semester;
    private double avgScore;
    private double passRate; // 0..1
}