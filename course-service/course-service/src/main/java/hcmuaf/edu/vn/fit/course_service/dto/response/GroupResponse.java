package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class GroupResponse {
    private String id;
    private String groupName;
    private String topic;
    private String createdById;
    private String conversationId;
    private String parentGroupId;
    private String parentGroupName;
    private boolean subgroup;
    private int subgroupCount;

    private List<ParticipantResponse> participants;
}
