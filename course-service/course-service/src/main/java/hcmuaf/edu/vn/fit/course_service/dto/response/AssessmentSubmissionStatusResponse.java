package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentSubmissionStatusResponse {
    private String id;
    private String assessmentId;
    private String studentId;
    private String rubricId;
    private String fileUrl;
    private String submittedLink;
    private LocalDateTime submittedAt;
    private String status;
    private boolean submitted;
    private Double totalScore;
    private String grade;
    private String comment;
    private List<SubmissionCriterionScoreResponse> gradedCriteria;
}
