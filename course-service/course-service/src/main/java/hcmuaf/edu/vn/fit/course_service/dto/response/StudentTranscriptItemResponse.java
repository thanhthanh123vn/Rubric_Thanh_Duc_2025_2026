package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentTranscriptItemResponse {
    private String enrollmentId;
    private String courseId;
    private String courseName;
    private String offeringId;

    private Float attendanceScore;
    private Float assignmentScore;
    private Float midtermScore;
    private Float finalScore;
    private Float totalScore;
    private String letterGrade;
}