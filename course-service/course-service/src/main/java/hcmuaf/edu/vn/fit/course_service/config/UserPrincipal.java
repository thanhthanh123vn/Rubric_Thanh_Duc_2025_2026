package hcmuaf.edu.vn.fit.course_service.config;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserPrincipal {
    private String userId;
    private String username;
    private String role;
}