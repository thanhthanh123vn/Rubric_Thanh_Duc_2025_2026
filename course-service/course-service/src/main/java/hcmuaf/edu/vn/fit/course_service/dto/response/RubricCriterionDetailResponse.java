package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RubricCriterionDetailResponse {
    private String criteriaId;
    private String criteriaName;
    private String levelId;
    private String levelName;
    private Number score;
    private Number maxScore;
}
