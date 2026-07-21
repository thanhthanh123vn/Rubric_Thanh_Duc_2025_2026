package hcmuaf.edu.vn.fit.grading_service.dto.response;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentInfoDto {
    private String studentId;
    private String fullName;
}