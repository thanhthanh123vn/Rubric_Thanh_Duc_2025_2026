package hcmuaf.edu.vn.fit.course_service.mapper;

import hcmuaf.edu.vn.fit.course_service.dto.response.ConversationResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Conversation;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-20T04:58:03+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 23.0.1 (Oracle Corporation)"
)
@Component
public class ConversationMapperImpl implements ConversationMapper {

    @Autowired
    private ParticipantMapper participantMapper;

    @Override
    public ConversationResponse toResponse(Conversation conversation) {
        if ( conversation == null ) {
            return null;
        }

        ConversationResponse.ConversationResponseBuilder conversationResponse = ConversationResponse.builder();

        conversationResponse.id( conversation.getId() );
        conversationResponse.conversationName( conversation.getConversationName() );
        conversationResponse.conversationAvatar( conversation.getConversationAvatar() );
        conversationResponse.conversationType( conversation.getConversationType() );
        conversationResponse.lastMessage( conversation.getLastMessage() );
        conversationResponse.participants( participantMapper.toResponseList( conversation.getParticipants() ) );

        return conversationResponse.build();
    }

    @Override
    public List<ConversationResponse> toResponseList(List<Conversation> conversations) {
        if ( conversations == null ) {
            return null;
        }

        List<ConversationResponse> list = new ArrayList<ConversationResponse>( conversations.size() );
        for ( Conversation conversation : conversations ) {
            list.add( toResponse( conversation ) );
        }

        return list;
    }
}
