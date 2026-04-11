package hcmuaf.edu.vn.fit.course_service.dto.response;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TopicResponse {
    private String topicId;
    private String userId;
    private String username;
    private String content;
    private String postType;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}
