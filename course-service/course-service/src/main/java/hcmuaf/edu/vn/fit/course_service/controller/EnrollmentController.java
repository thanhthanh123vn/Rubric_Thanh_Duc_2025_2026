package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.response.StudentTranscriptItemResponse;
import hcmuaf.edu.vn.fit.course_service.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/course-service/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @GetMapping("/students/{studentId}/transcript")
    public List<StudentTranscriptItemResponse> getStudentTranscript(@PathVariable String studentId) {
        return enrollmentService.getStudentTranscript(studentId);
    }
}