package hcmuaf.edu.vn.fit.course_service.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class TypingEvent {
    private String senderId;
    @JsonProperty("isTyping")
    private boolean isTyping;
}