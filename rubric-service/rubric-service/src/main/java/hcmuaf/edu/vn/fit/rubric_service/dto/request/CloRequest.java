package hcmuaf.edu.vn.fit.rubric_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CloRequest {
    private String cloCode;
    private String cloName;
    private String description;
    private String bloomLevel;
    private String courseId;


}
