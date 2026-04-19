package hcmuaf.edu.vn.fit.course_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;
@Data
@Builder
@AllArgsConstructor
public class GroupRequest {
    private String offeringId;
    private String createdById;    
    private String groupName;
    private String topic;
    private List<String> memberIds;
}
