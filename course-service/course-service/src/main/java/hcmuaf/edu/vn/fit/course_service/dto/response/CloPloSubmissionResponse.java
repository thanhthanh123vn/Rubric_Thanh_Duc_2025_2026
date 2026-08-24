package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CloPloSubmissionResponse {
    private String submissionId;
    private String courseId;
    private String courseCode;
    private String courseName;
    private String mainLecturerName;
    private String submissionType;
    private String status;
    private Integer revisionNumber;
    private LocalDateTime submittedAt;
    private String reviewedBy;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private String rejectionReason;
    private WorkflowState cloWorkflow;
    private WorkflowState mappingWorkflow;
    private List<CloItem> clos;
    private List<PloItem> plos;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkflowState {
        private String submissionId;
        private String status;
        private Integer revisionNumber;
        private LocalDateTime submittedAt;
        private String reviewedByName;
        private LocalDateTime reviewedAt;
        private String rejectionReason;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CloItem {
        private String cloId;
        private String cloCode;
        private String cloName;
        private String description;
        private String bloomLevel;
        private String approvalStatus;
        private LocalDateTime submittedAt;
        private String reviewedByName;
        private LocalDateTime reviewedAt;
        private String rejectionReason;
        private List<String> mappedPloIds;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PloItem {
        private String ploId;
        private String ploCode;
        private String description;
    }
}
