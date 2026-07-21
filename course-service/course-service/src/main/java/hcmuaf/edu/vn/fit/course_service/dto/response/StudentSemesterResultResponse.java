package hcmuaf.edu.vn.fit.course_service.dto.response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentSemesterResultResponse {
    private String studentId;
    private List<SemesterResultDto> semesters;
}