package hcmuaf.edu.vn.fit.course_service.client;

import hcmuaf.edu.vn.fit.course_service.dto.response.GradeDetailResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "grading-service")
public interface GradingClient {
    @GetMapping("/api/v1/grading-service/count/{assessmentId}")
    Long getGradedCount(@PathVariable("assessmentId") String assessmentId);

    @GetMapping("/api/v1/grading-service/grade/assessment/{assessmentId}/student/{studentId}")
    GradeDetailResponse getGradeByStudentAndAssessment(
            @PathVariable("assessmentId") String assessmentId,
            @PathVariable("studentId") String studentId
    );
}
