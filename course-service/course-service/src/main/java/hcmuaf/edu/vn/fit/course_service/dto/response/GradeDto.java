package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeDto {

    private Long id;

    private String grade;

    private String submissionId;


    private String assessmentId;

    private String comment;


    private String studentId;

    private String rubricId;

    private String status;


    private Double totalScore;

}