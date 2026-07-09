package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SplitGroupResponse {
    private List<GroupResponse> createdGroups;
}
