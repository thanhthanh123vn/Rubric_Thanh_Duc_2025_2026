package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentLecturerResponse {
    private String assessmentId;
    private String assessmentName;
    private String lecturerName;
    private String description;
    private String assessmentType;
    private Float weight;
    private String fileUrl;
    private String offeringId;

    private Timestamp startTime;
    private Timestamp endTime;
}