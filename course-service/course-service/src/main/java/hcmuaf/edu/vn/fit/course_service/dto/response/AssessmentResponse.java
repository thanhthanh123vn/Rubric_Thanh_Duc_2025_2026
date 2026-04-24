package hcmuaf.edu.vn.fit.course_service.dto.response;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class AssessmentResponse {

    private String assessmentId;

    private String assessmentName;
    private String description;

    private String assessmentType;

    private Float weight;

    private String offeringId;

    private String fileUrl;
    private String status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private LocalDateTime createdAt;
}