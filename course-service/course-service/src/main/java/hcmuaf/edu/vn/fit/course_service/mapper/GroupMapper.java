package hcmuaf.edu.vn.fit.course_service.mapper;

import hcmuaf.edu.vn.fit.course_service.dto.request.GroupRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.GroupResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.ParticipantResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Group;
import hcmuaf.edu.vn.fit.course_service.entity.Participant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface GroupMapper {

    @Mapping(source = "conversation.id", target = "conversationId")
    @Mapping(source = "conversation.participants", target = "participants")
    @Mapping(source = "parentGroup.id", target = "parentGroupId")
    @Mapping(source = "parentGroup.groupName", target = "parentGroupName")
    @Mapping(target = "subgroup", expression = "java(group.getParentGroup() != null)")
    @Mapping(target = "subgroupCount", expression = "java(group.getSubgroups() != null ? group.getSubgroups().size() : 0)")
    GroupResponse toGroupResponse(Group group);

    List<GroupResponse> toGroupResponseList(List<Group> groups);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "courseOffering", ignore = true)
    @Mapping(target = "parentGroup", ignore = true)
    @Mapping(target = "subgroups", ignore = true)
    @Mapping(target = "conversation", ignore = true)
    Group toGroup(GroupRequest request);

    @Mapping(source = "participantRole", target = "role")
    ParticipantResponse toParticipantResponse(Participant participant);
}
