package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private String userId;
    private String username;
    private String fullName;
    private String role;


}