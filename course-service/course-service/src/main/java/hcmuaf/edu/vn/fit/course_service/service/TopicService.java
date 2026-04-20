package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.TopicRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.TopicResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.UserResponse;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.Topic;
import hcmuaf.edu.vn.fit.course_service.mapper.TopicMapper;
import hcmuaf.edu.vn.fit.course_service.repository.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TopicService {

    private final TopicRepository topicRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final TopicMapper topicMapper;
    private final UserClient userClient;


    public List<TopicResponse> findByOfferingId(String offeringId) {

        List<Topic> topics = topicRepository.findByOfferingId(offeringId);

        // Chuyển sang DTO
        List<TopicResponse> responses = topics.stream()
                .map(topicMapper::toResponse)
                .collect(Collectors.toList());


        List<String> userIds = responses.stream()
                .map(TopicResponse::getUserId)
                .distinct()
                .collect(Collectors.toList());

        try {
            Map<String, UserResponse> users = userClient.getUsers(userIds);
            responses.forEach(res -> {
                if (users.containsKey(res.getUserId())) {
                    res.setUsername(users.get(res.getUserId()).getUsername());
                } else {
                    res.setUsername("Unknown User");
                }
            });
        } catch (Exception e) {
            log.error("Lỗi khi gọi User Service lấy thông tin người đăng bài", e);
            responses.forEach(res -> res.setUsername("Unknown User"));
        }

        return responses;
    }


    public TopicResponse createTopic(String offeringId, String userId, TopicRequest request) {
        CourseOffering offering = courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học với ID: " + offeringId));

        Topic topic = topicMapper.toEntity(request);
        topic.setPostId(UUID.randomUUID().toString());
        topic.setCourseOffering(offering);
        topic.setUserId(userId);


        if (topic.getPostType() == null) topic.setPostType("NORMAL");
        topic.setIsPinned(false);
        topic.setIsDeleted(false);

        Topic savedTopic = topicRepository.save(topic);
        TopicResponse response = topicMapper.toResponse(savedTopic);


        try {
            Map<String, UserResponse> users = userClient.getUsers(List.of(userId));
            response.setUsername(users.containsKey(userId) ? users.get(userId).getUsername() : "Unknown User");
        } catch (Exception e) {
            response.setUsername("Unknown User");
        }

        return response;
    }
}