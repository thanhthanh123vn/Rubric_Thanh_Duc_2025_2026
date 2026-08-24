package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeachingAssignmentProposalResponse {
    private String proposalId;
    private String offeringId;
    private String offeringName;
    private String courseId;
    private String courseCode;
    private String courseName;
    private String department;
    private String semester;
    private List<LecturerInfo> lecturers;
    private List<LecturerInfo> previousLecturers;
    private String requestedBy;
    private String requestedByName;
    private String requestNote;
    private String status;
    private String reviewedBy;
    private String reviewedByName;
    private String reviewNote;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
