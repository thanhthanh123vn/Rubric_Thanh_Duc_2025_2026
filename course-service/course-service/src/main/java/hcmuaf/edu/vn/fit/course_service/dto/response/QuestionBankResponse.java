package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuestionBankResponse {
    private String id;
    private String name;
    private String offeringId;
    private String lecturerId;
}