package hcmuaf.edu.vn.fit.course_service.mapper;



import hcmuaf.edu.vn.fit.course_service.dto.request.CommentRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.CommentResponse;
import hcmuaf.edu.vn.fit.course_service.entity.AssessmentComment;
import hcmuaf.edu.vn.fit.course_service.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CommentMapper {


    @Mapping(source = "topic.postId", target = "postId")
    CommentResponse toResponse(Comment comment);


    @Mapping(target = "commentId", ignore = true)
    @Mapping(target = "topic", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Comment toEntity(CommentRequest request);


    CommentResponse toResponse(AssessmentComment assessmentComment);
}