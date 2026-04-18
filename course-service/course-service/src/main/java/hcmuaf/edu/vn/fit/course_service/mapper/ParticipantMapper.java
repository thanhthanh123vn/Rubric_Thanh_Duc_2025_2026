package hcmuaf.edu.vn.fit.course_service.mapper;

import hcmuaf.edu.vn.fit.course_service.dto.response.ParticipantResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Participant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ParticipantMapper {


    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "participantRole", target = "role")
    ParticipantResponse toResponse(Participant participant);

    List<ParticipantResponse> toResponseList(List<Participant> participants);
}