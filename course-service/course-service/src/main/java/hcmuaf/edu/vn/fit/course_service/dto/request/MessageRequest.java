package hcmuaf.edu.vn.fit.course_service.dto.request;
import lombok.Data;

@Data
public class MessageRequest {
    private String offeringId;
    private String senderId;
    private String content;
}