package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.response.DeanDashboardResponse;
import hcmuaf.edu.vn.fit.course_service.service.DeanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/course-service/dean")
@RequiredArgsConstructor
public class DeanContrller {
    private final DeanService deanService;
    @GetMapping("'/overview")
    public ResponseEntity<DeanDashboardResponse> getOverview(@RequestHeader("X-User-Id")String userId) {
        if(userId==null){
            return ResponseEntity.badRequest().build();
        }

        DeanDashboardResponse deanDashboardResponse = deanService.getDeanDashboardData(userId);
        return ResponseEntity.ok(deanDashboardResponse);

    }
}
