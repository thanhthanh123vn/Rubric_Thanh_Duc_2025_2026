package hcmuaf.edu.vn.fit.rubric_service.dto.request;


import lombok.Data;

@Data
public class DescriptorRequest {

    private String criterionId;

    private String levelId;

    private Double score;

    private String description;
}
