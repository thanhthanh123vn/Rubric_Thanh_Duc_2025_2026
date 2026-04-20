package hcmuaf.edu.vn.fit.course_service.dto.response;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MessageResponse {
    private String messageId;
    private String senderId;
    private String content;
    private LocalDateTime createdAt;
}