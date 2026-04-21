package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class AssessmentReponse {
    private String assessmentId;
    private String assessmentName;
    private double weight;
    private Timestamp endTime;
    private String submissionId;
    private Timestamp submissionAt;
    private double calculatedScore;
    private String lecturerComment;
    private List<String> cloCode;


}
