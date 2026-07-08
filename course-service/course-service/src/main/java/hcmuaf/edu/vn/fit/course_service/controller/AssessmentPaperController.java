package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.GenerateExamRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.ExamQuestionDetailResponse;
import hcmuaf.edu.vn.fit.course_service.entity.AssessmentPaper;
import hcmuaf.edu.vn.fit.course_service.service.AssessmentPaperService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/course-service/assessments/paper")
@RequiredArgsConstructor
public class AssessmentPaperController {

    private final AssessmentPaperService assessmentPaperService;


    @PostMapping("/generate")
    public ResponseEntity<?> generateExamPaper(  @RequestHeader(value = "X-User-Id", required = false) String userId,@RequestBody GenerateExamRequest request) {

        try {

           List<ExamQuestionDetailResponse> generatedPaper = assessmentPaperService.generateExamQuestions(userId,request);


            return ResponseEntity.ok(generatedPaper);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/getAllExams")
    public ResponseEntity<List<AssessmentPaper>> getByLecturer(@RequestHeader("X-User-Id") String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<AssessmentPaper> papers = assessmentPaperService.getAllByLecturer(userId);
        return ResponseEntity.ok(papers);
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<?> publishExam(@PathVariable String id) {
        try {

            assessmentPaperService.publishExam(id);
            return ResponseEntity.ok(Map.of("message", "Giao đề thi thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }


    @GetMapping("/student/my-exams")
    public ResponseEntity<?> getStudentAssignedExams(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam("offeringId") String offeringId
    ) {
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Thiếu thông tin người dùng");
        }
        return ResponseEntity.ok(assessmentPaperService.getAssignedExamsForStudent(userId, offeringId));
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