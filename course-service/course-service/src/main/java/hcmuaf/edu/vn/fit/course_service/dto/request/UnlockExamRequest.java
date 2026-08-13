package hcmuaf.edu.vn.fit.course_service.dto.request;

import lombok.Data;

@Data
public class UnlockExamRequest {

    private String examId;

    private String studentId;

    private String deviceToken;
}