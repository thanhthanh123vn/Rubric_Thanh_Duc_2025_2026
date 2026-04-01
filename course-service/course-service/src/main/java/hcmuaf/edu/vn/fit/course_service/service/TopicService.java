package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.entity.Topic;
import hcmuaf.edu.vn.fit.course_service.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TopicService {

    @Autowired
    private TopicRepository topicRepository;

    public Topic findById(Long id) {
        return topicRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Topic not found")
        );
    }
    public List<Topic> findByOfferingId(String offeringId) {
        return topicRepository.findByOfferingId(offeringId);
    }
}
