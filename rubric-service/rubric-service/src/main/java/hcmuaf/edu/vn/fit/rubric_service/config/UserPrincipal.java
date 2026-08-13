package hcmuaf.edu.vn.fit.rubric_service.config;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class UserPrincipal {
    private String userId;
    private String username;
    private String role;
}