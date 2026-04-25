package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OBECloDetailResponse {

    private String cloId;
    private String cloCode;
    private String cloDescription;

    private List<StudentScoreResponse> students;

    private List<AssessmentMappingResponse> assessments;

}
