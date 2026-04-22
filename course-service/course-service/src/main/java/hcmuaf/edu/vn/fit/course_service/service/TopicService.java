package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.TopicRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.TopicResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.UserResponse; // Dùng UserResponse chung
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.Topic;
import hcmuaf.edu.vn.fit.course_service.mapper.TopicMapper;
import hcmuaf.edu.vn.fit.course_service.repository.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;



@Service
@RequiredArgsConstructor
@Slf4j
public class TopicService {

    private final TopicRepository topicRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final TopicMapper topicMapper;
    private final UserClient userClient;



    public List<TopicResponse> getTopicsByOfferingId(String offeringId) {
        List<Topic> topics = topicRepository.findByOfferingId(offeringId);

        return topics.stream().map(topic -> {
            TopicResponse response = topicMapper.toResponse(topic);

            UserResponse user = userClient.getUser(topic.getUserId());

            String displayName = "Unknown User";

            if (user != null) {
                displayName = user.getFullName() != null ? user.getFullName() : user.getUsername();

                try {
                    LecturerResponse lecturer = userClient.getLecturerByUserId(user.getUserId());
                    if (lecturer != null && lecturer.getFullName() != null) {
                        displayName = lecturer.getFullName();
                    }
                } catch (Exception ignored) {
                }
            }

            response.setFullName(displayName);
            return response;
        }).collect(Collectors.toList());
    }

    public TopicResponse createTopic(String offeringId, String userId, TopicRequest request) {
        CourseOffering offering = courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học với ID: " + offeringId));

        Topic topic = topicMapper.toEntity(request);
        topic.setPostId(UUID.randomUUID().toString());
        topic.setCourseOffering(offering);

        // Gán chuỗi userId vào Topic
        topic.setUserId(userId);

        if (topic.getPostType() == null) topic.setPostType("NORMAL");
        topic.setIsPinned(false);
        topic.setIsDeleted(false);

        Topic savedTopic = topicRepository.save(topic);

        return topicMapper.toResponse(savedTopic);
    }
}