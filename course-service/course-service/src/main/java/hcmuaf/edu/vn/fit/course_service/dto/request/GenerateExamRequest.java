package hcmuaf.edu.vn.fit.course_service.dto.request;

import lombok.Data;

import java.time.Instant;

@Data
public class GenerateExamRequest {
    private String assessmentId;
    private String offeringId;
    private String questionBankId;
    private int easyCount;
    private int mediumCount;
    private int hardCount;
//    private String chapterId;
    private String cloId;

    private String examTitle;
    private Integer durationMinutes;
    private Instant startTime;
    private Instant endTime;

}