package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.GenerateExamRequest;
import hcmuaf.edu.vn.fit.course_service.entity.AssessmentPaper;
import hcmuaf.edu.vn.fit.course_service.service.AssessmentPaperService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/course-service/assessments/paper")
@RequiredArgsConstructor
public class AssessmentPaperController {

    private final AssessmentPaperService assessmentPaperService;


    @PostMapping("/generate")
    public ResponseEntity<?> generateExamPaper(  @RequestHeader(value = "X-User-Id", required = false) String userId,@RequestBody GenerateExamRequest request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User ID is missing");
        }
        try {
            AssessmentPaper generatedPaper = assessmentPaperService.generateExamPaper(request);


            return ResponseEntity.ok(generatedPaper);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // (Tùy chọn) Thêm API để xem đề thi đã bốc gồm những câu nào
    // Dành cho giảng viên review trước khi publish
    /*
    @GetMapping("/{assessmentId}")
    public ResponseEntity<?> getExamPaper(@PathVariable String assessmentId) {
        // Gọi service tìm AssessmentPaper theo AssessmentID và join với bảng Questions
        return ...
    }
    */
}