package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.Map;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssessmentDetailResponse {
    private String assessmentId;
    private String description;
    private String assessmentName;
    private String fileUrl;
    private double weight;
    private Timestamp endTime;
    private String submissionId;
    private Timestamp submissionAt;
    private double calculatedScore;
    private String lecturerComment;
    private String rubricId;
    private Map<String,String> clos;
    private String submittedFileUrl;
    private String submittedLink;
}
