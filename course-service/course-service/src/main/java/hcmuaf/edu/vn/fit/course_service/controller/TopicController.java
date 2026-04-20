package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.TopicRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.TopicResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Topic;
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

    @GetMapping("/{topicId}")
    public List<TopicResponse> getTopic(@PathVariable("topicId") String topicId){
        return topicService.findByOfferingId(topicId);
    }

    @GetMapping("/offerings/{offeringId}/topics")
    public List<TopicResponse> findByOfferingId(@PathVariable("offeringId") String offeringId){
        return topicService.findByOfferingId(offeringId);
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
}
