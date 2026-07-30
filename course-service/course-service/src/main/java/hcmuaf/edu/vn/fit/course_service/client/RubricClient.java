package hcmuaf.edu.vn.fit.course_service.client;

import hcmuaf.edu.vn.fit.course_service.dto.response.DeanDashboardResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(
        name = "rubric-service",
        url = "${clients.rubric-service.url:http://localhost:8083/api/v1/rubric-service}",
        configuration = FeignConfig.class
)
public interface RubricClient {

    @GetMapping("/rubrics/count")
    long getRubricCount();

    @GetMapping("/rubrics/approvals")
    List<Object> getRubricsForApproval(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam("status") String status
    );
    @GetMapping("/rubrics/department/{departmentId}/activities")
    List<DeanDashboardResponse.ActivityDto> getDepartmentActivities(
            @PathVariable("departmentId") String departmentId,
            @RequestParam("limit") int limit
    );
}