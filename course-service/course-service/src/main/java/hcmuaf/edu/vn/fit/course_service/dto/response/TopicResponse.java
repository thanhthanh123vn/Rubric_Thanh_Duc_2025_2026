package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Data;

import java.time.Instant;


@Data
public class TopicResponse {
    private String postId;
    private String offeringId;
    private String userId;
    private String username;
    private String fullName;
    private String avatarUrl;
    private String content;
    private String postType;
    private Boolean isPinned;
    private Instant createdAt;
    private Instant updatedAt;
}