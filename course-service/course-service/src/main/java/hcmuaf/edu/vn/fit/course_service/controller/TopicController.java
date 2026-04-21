package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.CommentRequest;
import hcmuaf.edu.vn.fit.course_service.dto.request.TopicRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.CommentResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.TopicResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Topic;
import hcmuaf.edu.vn.fit.course_service.service.CommentService;
import hcmuaf.edu.vn.fit.course_service.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/course-service/topic")
public class TopicController {


    private final TopicService topicService;
    private final CommentService commentService;
    @GetMapping("/{topicId}")
    public List<TopicResponse> getTopic(@PathVariable("topicId") String topicId){
        return topicService.getTopicsByOfferingId(topicId);
    }

    @GetMapping("/offerings/{offeringId}/topics")
    public List<TopicResponse> findByOfferingId(@PathVariable("offeringId") String offeringId){
        return topicService.getTopicsByOfferingId(offeringId);
    }
    @PostMapping("/offerings/{offeringId}/topics")
    public TopicResponse createTopic(
            @PathVariable("offeringId") String offeringId,
            @RequestHeader("X-User-Id") String userId,
            @RequestBody TopicRequest request) {

        return topicService.createTopic(
                offeringId,
                userId,
                request

        );
    }
    @PostMapping("/offerings/{postId}/comments")
    public CommentResponse addComment(
            @PathVariable("postId") String postId,
            @RequestHeader("X-User-Id") String userId,
            @RequestBody CommentRequest request) {
        return commentService.addComment(postId, userId, request);
    }


    @GetMapping("/offerings/{postId}/comments")
    public List<CommentResponse> getComments( @RequestHeader("X-User-Id") String userId,@PathVariable("postId") String postId) {
        return commentService.getCommentsByPostId(userId,postId);
    }
}
