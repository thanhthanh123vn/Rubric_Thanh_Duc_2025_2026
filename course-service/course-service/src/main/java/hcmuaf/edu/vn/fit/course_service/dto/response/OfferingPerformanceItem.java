package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OfferingPerformanceItem {
    private String offeringId;
    private String offeringName;
    private String courseCode;
    private double avgScore;
    private double passRate;
    private long studentCount;
}