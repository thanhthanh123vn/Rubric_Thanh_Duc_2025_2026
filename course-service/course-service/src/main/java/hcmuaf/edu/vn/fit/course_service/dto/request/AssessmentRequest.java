package hcmuaf.edu.vn.fit.course_service.dto.request;



import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AssessmentRequest {

    private String assessmentName;
    private String description;

    private String assessmentType;

    private Float weight;

    private String offeringId;

    private String rubricId;

    private String fileUrl;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
}