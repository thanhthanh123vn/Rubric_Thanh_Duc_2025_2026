package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.response.TopicResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.UserResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Topic;
import hcmuaf.edu.vn.fit.course_service.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TopicService {

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private UserClient userClient;

    public TopicResponse findById(String id) {
        Topic topic =  topicRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Topic not found")
        );

        TopicResponse topicResponse = new TopicResponse();
        topicResponse.setTopicId(topic.getId());
        topicResponse.setContent(topic.getContent());
        topicResponse.setContent(topic.getContent());
        topicResponse.setCreatedDate(topic.getCreatedAt());
        topicResponse.setUpdatedDate(topic.getUpdatedAt());

        return topicResponse;
    }
    public List<TopicResponse> findByOfferingId(String offeringId) {
        System.out.println(offeringId);
        List<Topic> topics =  topicRepository.findByOfferingId(offeringId);

        List<String> userIds = topics.stream()
                .map(Topic::getUserId)
                .distinct()
                .toList();

        System.out.println(userIds.toString());

        Map<String,UserResponse> users = userClient.getUsers(userIds);

        return topics.stream().map(topic -> {
            TopicResponse res = new TopicResponse();
            res.setTopicId(topic.getId());
            res.setUserId(topic.getUserId());

            UserResponse user = users.get(topic.getUserId());
            res.setUsername(user != null ? user.getUsername() : "Unknown");

            res.setContent(topic.getContent());
            res.setPostType(topic.getPostType());
            res.setCreatedDate(topic.getCreatedAt());
            res.setUpdatedDate(topic.getUpdatedAt());

            return res;
        }).collect(Collectors.toList());

    }
}
