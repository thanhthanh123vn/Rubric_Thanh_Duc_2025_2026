package hcmuaf.edu.vn.fit.course_service.mapper;

import hcmuaf.edu.vn.fit.course_service.dto.request.GroupRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.GroupResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.ParticipantResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Conversation;
import hcmuaf.edu.vn.fit.course_service.entity.Group;
import hcmuaf.edu.vn.fit.course_service.entity.Participant;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-24T12:17:56+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 23.0.1 (Oracle Corporation)"
)
@Component
public class GroupMapperImpl implements GroupMapper {

    @Override
    public GroupResponse toGroupResponse(Group group) {
        if ( group == null ) {
            return null;
        }

        GroupResponse.GroupResponseBuilder groupResponse = GroupResponse.builder();

        groupResponse.conversationId( groupConversationId( group ) );
        List<Participant> participants = groupConversationParticipants( group );
        groupResponse.participants( participantListToParticipantResponseList( participants ) );
        groupResponse.id( group.getId() );
        groupResponse.groupName( group.getGroupName() );
        groupResponse.topic( group.getTopic() );
        groupResponse.createdById( group.getCreatedById() );

        return groupResponse.build();
    }

    @Override
    public List<GroupResponse> toGroupResponseList(List<Group> groups) {
        if ( groups == null ) {
            return null;
        }

        List<GroupResponse> list = new ArrayList<GroupResponse>( groups.size() );
        for ( Group group : groups ) {
            list.add( toGroupResponse( group ) );
        }

        return list;
    }

    @Override
    public Group toGroup(GroupRequest request) {
        if ( request == null ) {
            return null;
        }

        Group group = new Group();

        group.setCreatedById( request.getCreatedById() );
        group.setGroupName( request.getGroupName() );
        group.setTopic( request.getTopic() );

        return group;
    }

    @Override
    public ParticipantResponse toParticipantResponse(Participant participant) {
        if ( participant == null ) {
            return null;
        }

        ParticipantResponse.ParticipantResponseBuilder participantResponse = ParticipantResponse.builder();

        participantResponse.role( participant.getParticipantRole() );
        participantResponse.id( participant.getId() );
        participantResponse.userId( participant.getUserId() );

        return participantResponse.build();
    }

    private String groupConversationId(Group group) {
        Conversation conversation = group.getConversation();
        if ( conversation == null ) {
            return null;
        }
        return conversation.getId();
    }

    private List<Participant> groupConversationParticipants(Group group) {
        Conversation conversation = group.getConversation();
        if ( conversation == null ) {
            return null;
        }
        return conversation.getParticipants();
    }

    protected List<ParticipantResponse> participantListToParticipantResponseList(List<Participant> list) {
        if ( list == null ) {
            return null;
        }

        List<ParticipantResponse> list1 = new ArrayList<ParticipantResponse>( list.size() );
        for ( Participant participant : list ) {
            list1.add( toParticipantResponse( participant ) );
        }

        return list1;
    }
}
