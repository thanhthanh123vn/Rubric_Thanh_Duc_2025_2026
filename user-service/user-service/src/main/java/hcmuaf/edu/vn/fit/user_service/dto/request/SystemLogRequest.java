package hcmuaf.edu.vn.fit.user_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SystemLogRequest {
    private String level;
    private String action;
    private String message;
    private String username;
    private String ip;
}