package hcmuaf.edu.vn.fit.user_service.config;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserPrincipal {
    private String userId;
    private String username;
    private String role;
}