package hcmuaf.edu.vn.fit.course_service.dto.request;

import lombok.Data;

@Data
public class GenerateExamRequest {
    private String assessmentId;
    private String questionBankId;
    private int easyCount;
    private int mediumCount;
    private int hardCount;
    private String chapterId;
    private String cloId;
}