package hcmuaf.edu.vn.fit.rubric_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacultyResponse {
    private String facultyId;
    private String facultyName;
    private String deanName;
    private String deanUserId;
    private String email;
}
