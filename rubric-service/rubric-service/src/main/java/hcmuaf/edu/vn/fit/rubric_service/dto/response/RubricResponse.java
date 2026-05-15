package hcmuaf.edu.vn.fit.rubric_service.dto.response;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RubricResponse {

    private String id;

    private String name;

    private String description;

    private Float totalWeight;

    private List<CriteriaResponse> criteria;
}