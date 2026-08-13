package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.response.DashboardStatsResponse;
import hcmuaf.edu.vn.fit.course_service.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/course-service/student/dashboard")
@RequiredArgsConstructor
public class DashBoardController {
    private final DashboardService dashboardService;

    @GetMapping("/overview")
    public ResponseEntity<DashboardStatsResponse> getOverview(
            @RequestHeader("X-User-Id") String userId
    ) {
        if(userId==null)
            return ResponseEntity.badRequest().build();
            DashboardStatsResponse response = dashboardService.getStudentStats(userId);
        return ResponseEntity.ok(response);
    }
}
