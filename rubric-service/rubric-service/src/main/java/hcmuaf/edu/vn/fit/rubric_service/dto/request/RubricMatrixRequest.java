package hcmuaf.edu.vn.fit.rubric_service.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class RubricMatrixRequest {

    private String id;

    private String name;

    private String description;

    private String status;

    private List<CriterionRequest> criteria;

    private List<LevelRequest> levels;

    private List<DescriptorRequest> descriptors;
}
