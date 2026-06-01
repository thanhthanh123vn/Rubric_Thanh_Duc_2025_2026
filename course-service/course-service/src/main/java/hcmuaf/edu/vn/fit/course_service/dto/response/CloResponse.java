package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CloResponse {
    private String cloId;
    private String cloCode;
    private String description;
    private String bloomLevel;
}