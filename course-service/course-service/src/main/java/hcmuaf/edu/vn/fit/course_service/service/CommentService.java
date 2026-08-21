// File: hcmuaf.edu.vn.fit.course_service.service.CommentService.java
package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.CommentRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.CommentResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.UserResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Comment;
import hcmuaf.edu.vn.fit.course_service.entity.Topic;
import hcmuaf.edu.vn.fit.course_service.mapper.CommentMapper;
import hcmuaf.edu.vn.fit.course_service.repository.mongo.CommentMongoRepository; // Import MongoRepo
import hcmuaf.edu.vn.fit.course_service.repository.jpa.TopicRepository; // Topic vẫn dùng JPA
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentMongoRepository commentRepository;
    private final TopicRepository topicRepository;
    private final UserClient userClient;
    private final CommentMapper commentMapper;
    private final SimpMessagingTemplate messagingTemplate;

    public CommentResponse addComment(String postId, String userId, CommentRequest request) {

        Topic topic = topicRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng với ID: " + postId));

        Comment comment = commentMapper.toEntity(request);

        comment.setPostId(topic.getPostId());
        comment.setUserId(userId);
        comment.setCreatedAt(Date.from(Instant.now()));

        if (request.getParentId() != null && !request.getParentId().trim().isEmpty()) {
            comment.setParentId(request.getParentId());
        }

        Comment savedComment = commentRepository.save(comment);


        CommentResponse response = commentMapper.toResponse(savedComment);
        response.setParentId(savedComment.getParentId());

        try {
            UserResponse user = userClient.getUser(comment.getUserId());
            System.out.println("fullName"+user.getFullName());
            System.out.println("username la "+user.getUsername());
            if (user != null) {
                String displayName = (user.getFullName() != null && !user.getFullName().isEmpty())
                        ? user.getFullName()
                        : user.getUsername();
                response.setFullName(displayName);
                response.setUsername(displayName);
                response.setAvatarUrl(user.getAvatarUrl());
            } else {
                response.setFullName("Unknown");
                response.setUsername("Unknown");
            }
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin user {} cho comment: {}", comment.getUserId(), e.getMessage());
            response.setFullName("Unknown");
            response.setUsername("Unknown");
        }

        try {
            messagingTemplate.convertAndSend("/topic/posts/" + postId + "/comments", response);
        } catch (Exception e) {
            log.error("Lỗi khi phát sóng comment mới: {}", e.getMessage());
        }

        return response;
    }

    public List<CommentResponse> getCommentsByPostId(String currentUserId, String postId) {
        // Truy vấn MongoDB theo postId
        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(postId);

        return comments.stream().map(comment -> {
            CommentResponse res = commentMapper.toResponse(comment);

            try {
                UserResponse user = userClient.getUser(comment.getUserId());
                if (user != null) {
                    String displayName = (user.getFullName() != null && !user.getFullName().isEmpty())
                            ? user.getFullName()
                            : user.getUsername();
                    res.setFullName(displayName);
                    res.setUsername(displayName);
                    res.setAvatarUrl(user.getAvatarUrl());
                } else {
                    res.setFullName("Unknown");
                    res.setUsername("Unknown");
                }
            } catch (Exception e) {
                log.error("Lỗi khi lấy thông tin user {} cho comment: {}", comment.getUserId(), e.getMessage());
                res.setFullName("Unknown");
                res.setUsername("Unknown");
            }
            res.setMine(comment.getUserId().equals(currentUserId));

            return res;
        }).collect(Collectors.toList());
    }
}