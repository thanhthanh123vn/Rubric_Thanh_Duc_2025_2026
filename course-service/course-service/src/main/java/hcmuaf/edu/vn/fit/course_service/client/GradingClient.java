package hcmuaf.edu.vn.fit.course_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "grading-service") // Tên service trong Eureka
public interface GradingClient {
    @GetMapping("/api/v1/grade-service/count/{assessmentId}")
    Long getGradedCount(@PathVariable("assessmentId") String assessmentId);
}