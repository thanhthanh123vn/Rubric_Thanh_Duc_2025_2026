package hcmuaf.edu.vn.fit.rubric_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RubricLevelResponse {
    private String levelId;
    private String levelName;
    private String description;
    private Float score;
}
