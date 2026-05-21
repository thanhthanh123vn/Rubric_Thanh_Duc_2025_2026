package hcmuaf.edu.vn.fit.grading_service.dto.request;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationRequest {
    private String recipientId;
    private String message;
    private String type;
    private String senderId;
}