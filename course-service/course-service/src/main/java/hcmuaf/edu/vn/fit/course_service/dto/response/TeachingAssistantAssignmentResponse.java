package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeachingAssistantAssignmentResponse {
    private String offeringId;
    private String offeringName;
    private String courseCode;
    private String courseName;
    private String department;
    private String semester;
    private String academicYear;
    private String status;
    private LecturerInfo mainLecturer;
    private List<LecturerInfo> teachingAssistants;
}
