package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgramPloResponse {
    private String ploId;
    private String programId;
    private String ploCode;
    private String description;
    private int linkedCloCount;
    private String status;
}
