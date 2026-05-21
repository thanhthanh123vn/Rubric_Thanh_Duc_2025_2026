package hcmuaf.edu.vn.fit.grading_service.dto.request;

import hcmuaf.edu.vn.fit.grading_service.entity.CriteriaGrade;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class GradeRequest {
    private String submissionId;
    private String assessmentId;
    private String studentId;
    private String courseId;
    private String rubricId;
    private Double totalScore;
    private String generalComment;
    private Map<String, Double> scores;
    private List<CriteriaGrade> criteriaGrades;
}