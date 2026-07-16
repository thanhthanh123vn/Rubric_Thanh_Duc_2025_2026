package hcmuaf.edu.vn.fit.course_service.dto.response;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SubmitStudentExamResponse {
    private String submissionId;
    private String examId;
    private String attemptId;
    private double gradedScore;
    private String status;
    private Integer totalAnswered;
    private String message;
}