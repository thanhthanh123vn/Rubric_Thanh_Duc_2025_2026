package hcmuaf.edu.vn.fit.course_service.mapper;

import hcmuaf.edu.vn.fit.course_service.dto.request.TopicRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.TopicResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Topic;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = DateMapper.class)
public interface TopicMapper {

    @Mapping(source = "courseOffering.offeringId", target = "offeringId")


    @Mapping(target = "username", ignore = true)
    @Mapping(target = "fullName", ignore = true)
    TopicResponse toResponse(Topic topic);

    @Mapping(target = "courseOffering", ignore = true)
    @Mapping(target = "postId", ignore = true)


    @Mapping(target = "userId", ignore = true)

    @Mapping(target = "isPinned", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    Topic toEntity(TopicRequest request);
}