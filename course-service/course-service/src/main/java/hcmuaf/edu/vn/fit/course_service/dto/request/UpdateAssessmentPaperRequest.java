package hcmuaf.edu.vn.fit.course_service.dto.request;

import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class UpdateAssessmentPaperRequest {
    private String examTitle;
    private Integer durationMinutes;
    private Instant startTime;
    private Instant endTime;
    private List<String> questionIds;
    private String sourceQuestionBankId;
}
