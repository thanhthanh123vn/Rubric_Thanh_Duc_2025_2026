package hcmuaf.edu.vn.fit.rubric_service.dto.request;


import lombok.Data;

import java.util.List;

@Data
public class CriterionRequest {
    private String id;

    private String name;

    private Float weight;

    private String cloId;

    private List<LevelRequest> levels;
}
