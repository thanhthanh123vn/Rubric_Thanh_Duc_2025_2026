package hcmuaf.edu.vn.fit.rubric_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RubricMatrixResponse {
    private String id;
    private String name;
    private String description;

    private int courses;
    private int cloCount;
    private int criteriaCount;
    private Float totalWeight;
    private String status;

    private List<RubricMatrixRowResponse> rows;
}
