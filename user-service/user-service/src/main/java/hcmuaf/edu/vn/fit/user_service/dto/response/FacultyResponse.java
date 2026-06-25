package hcmuaf.edu.vn.fit.user_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FacultyResponse {
    private String facultyId;
    private String facultyName;
    private String deanName;
    private String deanUserId;
    private String email;
}