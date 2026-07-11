package hcmuaf.edu.vn.fit.grading_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackTemplateResponse {
    private Long id;
    private String content;
}
