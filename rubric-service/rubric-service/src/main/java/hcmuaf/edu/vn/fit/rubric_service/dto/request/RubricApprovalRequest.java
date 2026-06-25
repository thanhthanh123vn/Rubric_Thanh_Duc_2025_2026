package hcmuaf.edu.vn.fit.rubric_service.dto.request;

import lombok.Data;

@Data
public class RubricApprovalRequest {
    private String action;
    private String feedback;
}