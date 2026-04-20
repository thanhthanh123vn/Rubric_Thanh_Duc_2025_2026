package hcmuaf.edu.vn.fit.course_service.mapper;

import hcmuaf.edu.vn.fit.course_service.dto.response.ParticipantResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Participant;
import hcmuaf.edu.vn.fit.course_service.entity.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-20T04:58:03+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 23.0.1 (Oracle Corporation)"
)
@Component
public class ParticipantMapperImpl implements ParticipantMapper {

    @Override
    public ParticipantResponse toResponse(Participant participant) {
        if ( participant == null ) {
            return null;
        }

        ParticipantResponse.ParticipantResponseBuilder participantResponse = ParticipantResponse.builder();

        participantResponse.userId( participantUserUserId( participant ) );
        participantResponse.role( participant.getParticipantRole() );
        participantResponse.id( participant.getId() );

        return participantResponse.build();
    }

    @Override
    public List<ParticipantResponse> toResponseList(List<Participant> participants) {
        if ( participants == null ) {
            return null;
        }

        List<ParticipantResponse> list = new ArrayList<ParticipantResponse>( participants.size() );
        for ( Participant participant : participants ) {
            list.add( toResponse( participant ) );
        }

        return list;
    }

    private String participantUserUserId(Participant participant) {
        User user = participant.getUser();
        if ( user == null ) {
            return null;
        }
        return user.getUserId();
    }
}
