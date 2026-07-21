package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DepartmentSummaryItem {
    private String department;
    private long offerings;
    private long students;
    private double avgScore;
    private double passRate; // 0..1
}