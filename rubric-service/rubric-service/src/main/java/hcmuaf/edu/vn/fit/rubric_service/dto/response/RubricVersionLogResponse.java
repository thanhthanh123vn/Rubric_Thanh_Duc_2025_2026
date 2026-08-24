package hcmuaf.edu.vn.fit.rubric_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RubricVersionLogResponse {
    private String approvalRequestId;
    private String rubricId;
    private String rubricName;
    private String courseId;
    private String rubricType;
    private String rootRubricId;
    private String parentRubricId;
    private Integer sourceVersionNumber;
    private Integer versionNumber;
    private Integer revisionNumber;
    private String status;
    private String submittedBy;
    private String submittedByName;
    private LocalDateTime requestedAt;
    private String reviewedBy;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private String feedback;
}
