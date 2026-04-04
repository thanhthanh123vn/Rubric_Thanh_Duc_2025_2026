package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.entity.Topic;
import hcmuaf.edu.vn.fit.course_service.service.TopicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/topic")
public class TopicController {

    @Autowired
    private TopicService topicService;

    @GetMapping("/{topicId}")
    public Topic getTopic(@PathVariable("topicId") Long topicId){
        return topicService.findById(topicId);
    }

    @GetMapping("/offerings/{offeringId}/topics")
    public List<Topic> findByOfferingId(@PathVariable("offeringId") String offeringId){
        return topicService.findByOfferingId(offeringId);
    }
}
