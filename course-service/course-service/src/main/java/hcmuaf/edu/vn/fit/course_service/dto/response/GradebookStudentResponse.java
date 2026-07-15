package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GradebookStudentResponse {
    private String studentId;
    private String fullName;
    private Double attendanceScore;
    private Integer attendanceWarningCount;
    private Double assignmentScore;
    private Double componentScore;
    private Double examScore;
    private Double totalScore;
    private String letterGrade;
}
