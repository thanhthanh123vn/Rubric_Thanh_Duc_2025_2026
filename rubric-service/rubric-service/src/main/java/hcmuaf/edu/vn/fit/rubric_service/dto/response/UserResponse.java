package hcmuaf.edu.vn.fit.rubric_service.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private String userId;
    private String username;
    private String fullName;
    private String avatarUrl;
    private String email;
    private String role;


}
