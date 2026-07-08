package hcmuaf.edu.vn.fit.course_service.dto.response;

import hcmuaf.edu.vn.fit.course_service.entity.enums.StudentExamStatus;
import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data
@Builder
public class StudentAssignedExamResponse {
    private String assignmentId;
    private String assessmentPaperId;
    private String examTitle;
    private Integer durationMinutes;
    private Integer questionCount;
    private Instant startTime;
    private Instant endTime;
    private StudentExamStatus status;
}