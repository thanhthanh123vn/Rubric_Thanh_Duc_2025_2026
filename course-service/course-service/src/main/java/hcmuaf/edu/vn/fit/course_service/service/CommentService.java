package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.CommentRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.CommentResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.SinhVienResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.UserResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Comment;
import hcmuaf.edu.vn.fit.course_service.entity.Topic;
import hcmuaf.edu.vn.fit.course_service.mapper.CommentMapper; // Import Mapper
import hcmuaf.edu.vn.fit.course_service.repository.CommentRepository;
import hcmuaf.edu.vn.fit.course_service.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;
    private final TopicRepository topicRepository;
    private final UserClient userClient;
    private final CommentMapper commentMapper; // Tiêm CommentMapper vào đây


    public CommentResponse addComment(String postId, String userId, CommentRequest request) {
        Topic topic = topicRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng với ID: " + postId));


        Comment comment = commentMapper.toEntity(request);
        comment.setCommentId("CMT-" + UUID.randomUUID().toString().substring(0, 8));
        comment.setTopic(topic);
        comment.setUserId(userId);
        comment.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        Comment savedComment = commentRepository.save(comment);
        CommentResponse response = commentMapper.toResponse(savedComment);


        try {
            SinhVienResponse sv = userClient.getSinhVien(comment.getUserId());
            if (sv != null && sv.getFullName() != null) {
                response.setFullName(sv.getFullName());
                response.setUsername(sv.getFullName()); // Hoặc tên gì bạn muốn hiển thị
            } else {
                LecturerResponse lecturerResponse =userClient.getLecturerByUserId(comment.getUserId());
                if (lecturerResponse != null && lecturerResponse.getFullName() != null) {
                    response.setFullName(lecturerResponse.getFullName());
                    response.setUsername(lecturerResponse.getFullName());
                }
            }
        } catch (Exception e) {
            log.error("Không tìm thấy user {} cho comment", comment.getUserId());
            response.setFullName("Unknown");
            response.setUsername("Unknown");
        }


        return response;
    }



    public List<CommentResponse> getCommentsByPostId(String currentUserId, String postId) {
        List<Comment> comments = commentRepository.findByTopic_PostIdOrderByCreatedAtAsc(postId);

        return comments.stream().map(comment -> {
            CommentResponse res = commentMapper.toResponse(comment);

            try {

                SinhVienResponse sv = userClient.getSinhVien(comment.getUserId());
                if (sv != null && sv.getFullName() != null) {
                    res.setFullName(sv.getFullName());
                    res.setUsername(sv.getFullName()); // Hoặc tên gì bạn muốn hiển thị
                } else {
                    LecturerResponse lecturerResponse =userClient.getLecturerByUserId(comment.getUserId());
                    if (lecturerResponse != null && lecturerResponse.getFullName() != null) {
                        res.setFullName(lecturerResponse.getFullName());
                        res.setUsername(lecturerResponse.getFullName());
                    }
                }
            } catch (Exception e) {
                log.error("Không tìm thấy user {} cho comment", comment.getUserId());
                res.setFullName("Unknown");
                res.setUsername("Unknown");
            }

            res.setMine(comment.getUserId().equals(currentUserId));
            return res;
        }).collect(Collectors.toList());
    }
    private String fetchUsername(String userId) {
        try {
            Map<String, UserResponse> users = userClient.getUsers(List.of(userId));
            return users.containsKey(userId) ? users.get(userId).getUsername() : "Unknown";
        } catch (Exception e) {
            return "Unknown";
        }
    }
}