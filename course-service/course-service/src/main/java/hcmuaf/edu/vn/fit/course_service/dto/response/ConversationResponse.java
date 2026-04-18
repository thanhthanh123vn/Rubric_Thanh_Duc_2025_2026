package hcmuaf.edu.vn.fit.course_service.dto.response;

import hcmuaf.edu.vn.fit.course_service.entity.enums.ConversationType;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ConversationResponse {
    private String id;
    private String conversationName;
    private String conversationAvatar;
    private ConversationType conversationType;
    private String lastMessage;
    private List<ParticipantResponse> participants;
}