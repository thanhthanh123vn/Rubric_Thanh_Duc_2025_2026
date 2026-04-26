package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.CommentRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.AssessmentDetailResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.AssessmentLecturerResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.AssessmentReponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.CommentResponse;
import hcmuaf.edu.vn.fit.course_service.service.AssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/course-service")
public class AssessmentController {

    @Autowired
    private AssessmentService assessmentService;

    @GetMapping("/offerings/{offeringId}/assessments")
    public List<AssessmentReponse> getAssignments(
            @RequestHeader("X-User-Id") String studentId,
            @PathVariable String offeringId
    ) {
        return assessmentService.getAssByCourseOffering(offeringId, studentId);
    }


    @GetMapping("/assessments/{assessmentId}")
    public AssessmentDetailResponse getAssignmentDetail(
            @RequestHeader("X-User-Id") String studentId,
            @PathVariable String assessmentId
    ) {
        return assessmentService.getAssById(assessmentId, studentId);
    }

    @PostMapping("/assessments/{assessmentId}/submit")
    public Object submitAssignment(
            @RequestHeader("X-User-Id") String studentId,
            @PathVariable String assessmentId,
            @RequestParam(required = false) MultipartFile file,
            @RequestParam(required = false) String link
    ){
        return assessmentService.submitAssignment(assessmentId,studentId,file,link);

    }




    @PostMapping("/offerings/{offeringId}/assessments")
    public Object createAssessment(
            @PathVariable String offeringId,
            @RequestParam("assessmentName") String assessmentName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value="weight" , required = false ) Float weight,

            @RequestParam("assessmentType") String assessmentType,
            @RequestParam("endTime") String endTime,
            @RequestParam(value = "rubricId", required = false) String rubricId,
            @RequestParam(value = "cloIds", required = false) List<String> cloIds,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {

        return assessmentService.createAssessment(
                offeringId,
                assessmentName,
                description,
                weight,
                assessmentType,
                endTime,
                rubricId,
                cloIds,
                file
        );
    }
    @GetMapping("/offerings/{offeringId}/assessments-list")
    public ResponseEntity<List<AssessmentLecturerResponse>> getAssessmentsByOffering(@PathVariable String offeringId) {
        List<AssessmentLecturerResponse> list = assessmentService.getAssessmentsByOfferingId(offeringId);
        return ResponseEntity.ok(list);
    }
    @PutMapping("/assessments/{assessmentId}")
    public ResponseEntity<AssessmentLecturerResponse> updateAssessment(
            @PathVariable String assessmentId,
            @RequestParam("assessmentName") String assessmentName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "weight", required = false) Float weight,
            @RequestParam("assessmentType") String assessmentType,
            @RequestParam("endTime") String endTime,
            @RequestParam(value = "rubricId", required = false) String rubricId,
            @RequestParam(value = "cloIds", required = false) List<String> cloIds,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        AssessmentLecturerResponse response = assessmentService.updateAssessment(
                assessmentId, assessmentName, description, weight, assessmentType,
                endTime, rubricId, cloIds, file
        );
        return ResponseEntity.ok(response);
    }
    @DeleteMapping(value = "/assessments/{assessmentId}", produces = "application/json")
    public ResponseEntity<?> deleteAssessment(@PathVariable String assessmentId) {
        try {
            assessmentService.deleteAssessment(assessmentId);
            return ResponseEntity
                    .ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "success", true,
                            "message", "Xóa bài tập thành công!"
                    ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Lỗi: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/assessments/{assessmentId}/comments")
    public ResponseEntity<List<CommentResponse>> getAssessmentComments(
            @RequestHeader("X-User-Id") String currentUserId,
            @PathVariable String assessmentId
    ) {
        List<CommentResponse> comments = assessmentService.getCommentsByAssessmentId(currentUserId, assessmentId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/assessments/{assessmentId}/comments")
    public ResponseEntity<CommentResponse> addAssessmentComment(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String assessmentId,
            @RequestBody CommentRequest request
    ) {
        CommentResponse response = assessmentService.addAssessmentComment(assessmentId, userId, request);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/assessments/{assessmentId}/detail")
    public ResponseEntity<AssessmentDetailResponse> getDetail(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String assessmentId
    ) {
        return ResponseEntity.ok(assessmentService.getAssessmentDetail(assessmentId, userId));
    }

    @DeleteMapping("/assessments/{assessmentId}/unsubmit")
    public ResponseEntity<?> unsubmit(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String assessmentId
    ) {
        assessmentService.unsubmitAssignment(assessmentId, userId);
        return ResponseEntity.ok(Map.of("message", "Hủy nộp bài thành công"));
    }
}
