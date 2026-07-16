package hcmuaf.edu.vn.fit.course_service.controller;


import hcmuaf.edu.vn.fit.course_service.dto.request.SubmitStudentExamRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.StudentExamResultResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.SubmitStudentExamResponse;
import hcmuaf.edu.vn.fit.course_service.service.StudentExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/course-service/student/exams")
@RequiredArgsConstructor
public class StudentExamController {

    private final StudentExamService studentExamService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitExam(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @Valid @RequestBody SubmitStudentExamRequest request
    ) {
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Thiếu thông tin người dùng");
        }

        SubmitStudentExamResponse response = studentExamService.submitExam(userId,request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{examId}/result")
    public ResponseEntity<?> getExamResult(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @PathVariable String examId
    ) {
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Thiếu thông tin người dùng");
        }

        StudentExamResultResponse response = studentExamService.getExamResult(userId, examId);
        return ResponseEntity.ok(response);
    }
}