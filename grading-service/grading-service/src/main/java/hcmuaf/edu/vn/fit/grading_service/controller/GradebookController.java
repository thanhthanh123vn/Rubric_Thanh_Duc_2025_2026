package hcmuaf.edu.vn.fit.grading_service.controller;

import hcmuaf.edu.vn.fit.grading_service.dto.response.ApiResponse;
import hcmuaf.edu.vn.fit.grading_service.dto.response.GradebookResponse;
import hcmuaf.edu.vn.fit.grading_service.service.GradingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/grading/gradebook")
@RequiredArgsConstructor
public class GradebookController {
    private final GradingService gradingService;
//    @GetMapping("/{offeringId}")
//    public ResponseEntity<ApiResponse<GradebookResponse>> getGradebookByOffering(
//            @PathVariable String offeringId) {
//
//        GradebookResponse gradebook = gradingService.getGradebookForOffering(offeringId);
//
//        return ResponseEntity.ok(new ApiResponse<>(200, "Success", gradebook));
//    }
}
