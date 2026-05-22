package hcmuaf.edu.vn.fit.rubric_service.dto.request;

import lombok.Data;

@Data
public class LevelRequest {

    private String id;

    private String name;

    private Integer orderIndex;

    private Double score;

    private String description;
}
