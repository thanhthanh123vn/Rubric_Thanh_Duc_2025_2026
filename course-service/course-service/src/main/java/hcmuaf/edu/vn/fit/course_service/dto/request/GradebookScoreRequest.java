package hcmuaf.edu.vn.fit.course_service.dto.request;

import lombok.Data;

@Data
public class GradebookScoreRequest {
    private String studentId;
    private Double attendanceScore;
    private Double assignmentScore;
    private Double examScore;
    private Integer attendanceWarningCount;
}
