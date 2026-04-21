package hcmuaf.edu.vn.fit.course_service.mapper;

import hcmuaf.edu.vn.fit.course_service.dto.request.CommentRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.CommentResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Comment;
import hcmuaf.edu.vn.fit.course_service.entity.Topic;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-21T23:22:59+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 23.0.1 (Oracle Corporation)"
)
@Component
public class CommentMapperImpl implements CommentMapper {

    @Override
    public CommentResponse toResponse(Comment comment) {
        if ( comment == null ) {
            return null;
        }

        CommentResponse commentResponse = new CommentResponse();

        commentResponse.setPostId( commentTopicPostId( comment ) );
        commentResponse.setCommentId( comment.getCommentId() );
        commentResponse.setUserId( comment.getUserId() );
        commentResponse.setContent( comment.getContent() );
        commentResponse.setCreatedAt( comment.getCreatedAt() );

        return commentResponse;
    }

    @Override
    public Comment toEntity(CommentRequest request) {
        if ( request == null ) {
            return null;
        }

        Comment.CommentBuilder comment = Comment.builder();

        comment.content( request.getContent() );

        return comment.build();
    }

    private String commentTopicPostId(Comment comment) {
        Topic topic = comment.getTopic();
        if ( topic == null ) {
            return null;
        }
        return topic.getPostId();
    }
}
