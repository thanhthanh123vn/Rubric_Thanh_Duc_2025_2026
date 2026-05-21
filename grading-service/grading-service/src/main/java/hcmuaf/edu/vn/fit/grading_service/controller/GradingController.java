package hcmuaf.edu.vn.fit.grading_service.controller;

import hcmuaf.edu.vn.fit.grading_service.client.NotificationClient;
import hcmuaf.edu.vn.fit.grading_service.dto.request.GradeRequest;
import hcmuaf.edu.vn.fit.grading_service.dto.request.NotificationRequest;
import hcmuaf.edu.vn.fit.grading_service.dto.response.ApiResponse;
import hcmuaf.edu.vn.fit.grading_service.entity.Grade;
import hcmuaf.edu.vn.fit.grading_service.service.GradingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/grade-service")
@RequiredArgsConstructor
public class GradingController {

    @Autowired
    private GradingService service;
    private final NotificationClient notificationClient;


    @PostMapping("/grade")
    public Grade gradeStudent(
            @RequestParam String studentId,
            @RequestParam String rubricId) {

        return service.gradeStudent(studentId, rubricId);
    }
    @PostMapping
    public ResponseEntity<ApiResponse<String>> submitGrade(@RequestBody GradeRequest request) {
        service.processGrading(request);
        try {
            NotificationRequest notify = NotificationRequest.builder()
                    .recipientId(request.getStudentId())
                    .message("Bài tập đã được chấm. Tổng điểm: " + request.getTotalScore())
                    .type("GRADE_RELEASED")
                    .senderId("SYSTEM")
                    .build();

            notificationClient.sendNotification(notify);
        }catch (Exception e) {
                System.err.println("Lỗi khi gửi thông báo nộp bài: " + e.getMessage());
            }
        return ResponseEntity.ok(
                new ApiResponse<String>(200, "Chấm điểm thành công", null)
        );
    }
    @GetMapping("/count/{assessmentId}")
    public ResponseEntity<Long> countGraded(@PathVariable String assessmentId) {
        return ResponseEntity.ok(service.countGradedByAssessmentId(assessmentId));
    }
}