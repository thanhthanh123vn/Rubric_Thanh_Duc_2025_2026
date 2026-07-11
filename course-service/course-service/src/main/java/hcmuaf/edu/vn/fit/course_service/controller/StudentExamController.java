package hcmuaf.edu.vn.fit.course_service.controller;
import com.yourapp.exam.dto.SubmitStudentExamRequest;

import hcmuaf.edu.vn.fit.course_service.dto.response.SubmitStudentExamResponse;
import hcmuaf.edu.vn.fit.course_service.service.StudentExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/course-service/student/exams")
@RequiredArgsConstructor
public class StudentExamController {

    private final StudentExamService studentExamService;

    @PostMapping("/submit")
    public ResponseEntity<SubmitStudentExamResponse> submitExam(
            @Valid @RequestBody SubmitStudentExamRequest request
    ) {
        SubmitStudentExamResponse response = studentExamService.submit(request);
        return ResponseEntity.ok(response);
    }
}