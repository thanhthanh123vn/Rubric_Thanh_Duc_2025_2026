package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.GenerateExamRequest;
import hcmuaf.edu.vn.fit.course_service.dto.request.UpdateAssessmentPaperRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.ExamQuestionDetailResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.LecturerExamDetailResponse;
import hcmuaf.edu.vn.fit.course_service.entity.AssessmentPaper;
import hcmuaf.edu.vn.fit.course_service.exception.ResourceNotFoundException;
import hcmuaf.edu.vn.fit.course_service.service.AssessmentPaperService;
import jakarta.validation.Valid;
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
    @GetMapping("/{id}/detail")
    public ResponseEntity<?> getLecturerExamDetail(
            @PathVariable("id") String paperId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Thiếu thông tin người dùng");
        }

        try {

            LecturerExamDetailResponse response = assessmentPaperService.getLecturerExamDetail(paperId);
            return ResponseEntity.ok(response);

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateExamPaper(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody UpdateAssessmentPaperRequest request
    ) {
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Thiếu thông tin người dùng"));
        }

        try {
            AssessmentPaper updated = assessmentPaperService.updateExamPaper(id, userId, request);
            return ResponseEntity.ok(updated);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi hệ thống khi cập nhật đề thi"));
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExamPaper(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId
    ) {
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Thiếu thông tin người dùng"));
        }

        try {
            assessmentPaperService.deleteExamPaper(id, userId);
            return ResponseEntity.ok(Map.of("message", "Xóa đề thi thành công!"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi hệ thống khi xóa đề thi"));
        }
    }



}