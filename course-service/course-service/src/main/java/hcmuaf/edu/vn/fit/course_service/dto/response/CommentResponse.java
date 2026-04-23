package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Data;
import java.sql.Timestamp;

@Data
public class CommentResponse {
    private String commentId;
    private String postId;
    private String userId;
    private String username;
    private String fullName;
    private String avatarUrl;
    private boolean isMine;
    private String content;
    private Timestamp createdAt;

}