package hcmuaf.edu.vn.fit.rubric_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RubricMatrixRowResponse {
    private String cloId;
    private String criteriaId;
    private String criteriaName;
    private Float weight;

    private List<RubricLevelResponse> levels;
}
