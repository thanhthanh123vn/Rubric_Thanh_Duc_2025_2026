package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GradeDistributionItem {
    private String grade;
    private long count;
}