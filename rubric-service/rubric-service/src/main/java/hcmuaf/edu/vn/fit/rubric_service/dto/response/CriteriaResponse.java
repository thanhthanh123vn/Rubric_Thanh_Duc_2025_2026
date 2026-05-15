package hcmuaf.edu.vn.fit.rubric_service.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CriteriaResponse {

    private String id;
    private String cloId;

    private String name;

    private Float weight;
}
