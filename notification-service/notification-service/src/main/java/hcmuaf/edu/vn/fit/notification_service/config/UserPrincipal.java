package hcmuaf.edu.vn.fit.notification_service.config;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserPrincipal {
    private String userId;
    private String username;
    private String role;
}