package hcmuaf.edu.vn.fit.rubric_service.dto.response;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RubricResponse {

    private String id;

    private String name;

    private String description;

    private String facultyId;

    private String lecturerId;

    private String rubricType;

    private String visibility;

    private String rootRubricId;

    private String parentRubricId;

    private Integer versionNumber;

    private String status;

    private Float totalWeight;

    private List<CriteriaResponse> criteria;
}
