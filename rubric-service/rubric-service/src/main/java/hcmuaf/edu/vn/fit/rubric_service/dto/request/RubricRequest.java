package hcmuaf.edu.vn.fit.rubric_service.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class RubricRequest {
    private String rubricName;
    private String courseId;
    private String description;
    private boolean submitForApproval;

    private List<CriterionRequest> criteria;
}