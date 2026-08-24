package hcmuaf.edu.vn.fit.course_service.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class TeachingAssignmentProposalRequest {
    private String offeringId;
    private List<String> lecturerIds;
    private String note;
}
