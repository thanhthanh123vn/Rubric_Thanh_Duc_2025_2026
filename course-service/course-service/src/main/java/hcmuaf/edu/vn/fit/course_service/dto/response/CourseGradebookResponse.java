package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CourseGradebookResponse {
    private String offeringId;
    private Double attendanceWeight;
    private Double assignmentWeight;
    private Double componentWeight;
    private Double examWeight;
    private List<GradebookStudentResponse> students;
}
