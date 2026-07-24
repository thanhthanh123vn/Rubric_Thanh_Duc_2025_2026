package hcmuaf.edu.vn.fit.grading_service.config;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPrincipal {
    private String userId;
    private String username;
    private String role;

   
}