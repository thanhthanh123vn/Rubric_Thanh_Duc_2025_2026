package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.TopicRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.SinhVienResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.TopicResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.UserResponse;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.Lecturer;
import hcmuaf.edu.vn.fit.course_service.entity.Topic;
import hcmuaf.edu.vn.fit.course_service.entity.User;
import hcmuaf.edu.vn.fit.course_service.mapper.TopicMapper;
import hcmuaf.edu.vn.fit.course_service.repository.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.LecturerRepository;
import hcmuaf.edu.vn.fit.course_service.repository.TopicRepository;
import hcmuaf.edu.vn.fit.course_service.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final TopicMapper topicMapper;
    private final LecturerRepository lecturerRepository;
    private final UserClient userClient;

    public List<TopicResponse> getTopicsByOfferingId(String offeringId) {
        List<Topic> topics = topicRepository.findByOfferingId(offeringId);

        return topics.stream().map(topic -> {
            TopicResponse response = topicMapper.toResponse(topic);
            User user = topic.getUser();


            String fullNameToDisplay = user.getUsername();

            if ("TEACHER".equals(user.getRole())) {

                Optional<Lecturer> lecturerOpt = lecturerRepository.findByUser_UserId(user.getUserId());
                if (lecturerOpt.isPresent() && lecturerOpt.get().getFullName() != null) {
                    fullNameToDisplay = lecturerOpt.get().getFullName();
                }
            } else if ("STUDENT".equals(user.getRole())) {
                try {

                    SinhVienResponse svDetail = userClient.getSinhVien(user.getUserId());
                    if (svDetail != null && svDetail.getFullName() != null) {
                        fullNameToDisplay = svDetail.getFullName();
                        System.out.println(fullNameToDisplay);
                    }
                } catch (Exception e) {
                    System.out.println("Lỗi khi gọi user-service lấy tên sinh viên: " + e.getMessage());
                }
            }


            response.setFullName(fullNameToDisplay);
            return response;
        }).collect(Collectors.toList());
    }


    public TopicResponse createTopic(String offeringId, String userId, TopicRequest request) {
        CourseOffering offering = courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học với ID: " + offeringId));


        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        Topic topic = topicMapper.toEntity(request);
        topic.setPostId(UUID.randomUUID().toString());
        topic.setCourseOffering(offering);


        topic.setUser(user);

        if (topic.getPostType() == null) topic.setPostType("NORMAL");
        topic.setIsPinned(false);
        topic.setIsDeleted(false);

        Topic savedTopic = topicRepository.save(topic);


        return topicMapper.toResponse(savedTopic);
    }
}