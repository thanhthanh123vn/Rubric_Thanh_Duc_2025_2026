package hcmuaf.edu.vn.fit.course_service.mapper;

import hcmuaf.edu.vn.fit.course_service.dto.response.ConversationResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Conversation;
import org.mapstruct.Mapper;
import java.util.List;


@Mapper(componentModel = "spring", uses = {ParticipantMapper.class})
public interface ConversationMapper {

    ConversationResponse toResponse(Conversation conversation);

    List<ConversationResponse> toResponseList(List<Conversation> conversations);
}