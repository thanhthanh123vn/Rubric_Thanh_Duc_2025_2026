package hcmuaf.edu.vn.fit.rubric_service.dto.response;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CriteriaResponse {

    private String id;
    private String cloId;

    private String name;

    private String description;

    private Float weight;

    private List<RubricLevelResponse> levels;
}
