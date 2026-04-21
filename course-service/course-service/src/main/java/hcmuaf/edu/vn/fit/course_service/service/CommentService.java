package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.CommentRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.CommentResponse;
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
        comment.setPost(topic);
        comment.setUserId(userId);
        comment.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        Comment savedComment = commentRepository.save(comment);


        CommentResponse response = commentMapper.toResponse(savedComment);

        // Gắn thêm username
        response.setUsername(fetchUsername(userId));

        return response;
    }


    public List<CommentResponse> getCommentsByPostId(String postId) {
        List<Comment> comments = commentRepository.findByTopic_PostIdOrderByCreatedAtAsc(postId);


        List<String> userIds = comments.stream()
                .map(Comment::getUserId)
                .distinct()
                .collect(Collectors.toList());

        Map<String, UserResponse> users = null;
        try {
            if (!userIds.isEmpty()) {
                users = userClient.getUsers(userIds);
            }
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin user cho comment", e);
        }

        final Map<String, UserResponse> finalUsers = users;

        return comments.stream().map(comment -> {

            CommentResponse res = commentMapper.toResponse(comment);


            if (finalUsers != null && finalUsers.containsKey(comment.getUserId())) {
                res.setUsername(finalUsers.get(comment.getUserId()).getUsername());
            } else {
                res.setUsername("Unknown");
            }
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