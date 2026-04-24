package hcmuaf.edu.vn.fit.course_service.mapper;

import hcmuaf.edu.vn.fit.course_service.dto.request.TopicRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.TopicResponse;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.Topic;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-24T12:17:56+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 23.0.1 (Oracle Corporation)"
)
@Component
public class TopicMapperImpl implements TopicMapper {

    @Override
    public TopicResponse toResponse(Topic topic) {
        if ( topic == null ) {
            return null;
        }

        TopicResponse topicResponse = new TopicResponse();

        topicResponse.setOfferingId( topicCourseOfferingOfferingId( topic ) );
        topicResponse.setPostId( topic.getPostId() );
        topicResponse.setUserId( topic.getUserId() );
        topicResponse.setContent( topic.getContent() );
        topicResponse.setPostType( topic.getPostType() );
        topicResponse.setIsPinned( topic.getIsPinned() );
        topicResponse.setCreatedAt( topic.getCreatedAt() );
        topicResponse.setUpdatedAt( topic.getUpdatedAt() );

        return topicResponse;
    }

    @Override
    public Topic toEntity(TopicRequest request) {
        if ( request == null ) {
            return null;
        }

        Topic.TopicBuilder topic = Topic.builder();

        topic.content( request.getContent() );
        topic.postType( request.getPostType() );

        return topic.build();
    }

    private String topicCourseOfferingOfferingId(Topic topic) {
        CourseOffering courseOffering = topic.getCourseOffering();
        if ( courseOffering == null ) {
            return null;
        }
        return courseOffering.getOfferingId();
    }
}
