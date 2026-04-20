package hcmuaf.edu.vn.fit.course_service.dto.response;

import hcmuaf.edu.vn.fit.course_service.entity.enums.ParticipantRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ParticipantResponse {
    private String id;
    private String userId;
    private ParticipantRole role;
}