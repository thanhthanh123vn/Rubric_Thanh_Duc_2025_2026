package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OBEProgressResponse {
    private String cloId;
    private String cloCode;
    private String cloDescription;
    private Double totalWeight;
    private Double achievedScore;
    private Double progressPercent;
}
