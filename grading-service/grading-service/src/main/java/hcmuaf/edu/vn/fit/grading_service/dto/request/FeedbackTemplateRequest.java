package hcmuaf.edu.vn.fit.grading_service.dto.request;

import lombok.Data;

@Data
public class FeedbackTemplateRequest {
    private String userId;
    private String content;
}
