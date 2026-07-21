package hcmuaf.edu.vn.fit.course_service.dto.request;

import lombok.Data;

@Data
public class SystemLogRequest {
    private String level;
    private String action;
    private String message;
    private String username;
    private String ip;
}