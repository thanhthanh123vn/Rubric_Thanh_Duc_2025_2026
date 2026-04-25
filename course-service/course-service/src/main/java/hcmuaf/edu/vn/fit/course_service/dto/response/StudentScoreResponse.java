package hcmuaf.edu.vn.fit.course_service.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudentScoreResponse {

    private String studentId;
    private String fullName;
    private double score;

}
