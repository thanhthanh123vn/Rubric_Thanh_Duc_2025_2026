package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.client.NotificationClient;
import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.CommentRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.*;
import hcmuaf.edu.vn.fit.course_service.entity.Assessment;
import hcmuaf.edu.vn.fit.course_service.entity.SubmissionEntity;
import hcmuaf.edu.vn.fit.course_service.repository.AssessmentRepository;
import hcmuaf.edu.vn.fit.course_service.repository.EnrollmentRepository;
import hcmuaf.edu.vn.fit.course_service.service.AssessmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/course-service")
public class AssessmentController {

    @Autowired
    private AssessmentService assessmentService;
    private final EnrollmentRepository enrollmentRepository;
    private final NotificationClient notificationClient;
    private final UserClient userClient  ;
    @Autowired
    private AssessmentRepository assessmentRepository;

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
    @GetMapping("/assessments/{assessmentId}/submissions")
    public ResponseEntity<List<SubmissionEntity>> getSubmissionsByAssessment(
            @PathVariable String assessmentId
    ) {

        List<SubmissionEntity> submissions = assessmentService.getSubmissions(assessmentId);
        return ResponseEntity.ok(submissions);
    }
    @PostMapping("/assessments/{assessmentId}/submit")
    public ResponseEntity<?> submitAssignment(
            @RequestHeader("X-User-Id") String studentId,
            @PathVariable String assessmentId,
            @RequestParam(required = false) MultipartFile file,
            @RequestParam(required = false) String link,
              @RequestParam(required = false) String rubricId
    ){
        try {

            SubmissionEntity submission = assessmentService.submitAssignment(assessmentId, studentId, file, link,rubricId);


            Assessment assessment = assessmentRepository.findById(assessmentId).orElse(null);

            if (assessment != null && assessment.getCourseOffering() != null) {

                String courseId = assessment.getCourseOffering().getOfferingId();


                String lecturerId = assessment.getCourseOffering().getLecturerId();

                LecturerResponse lecturerResponse = userClient.getLecturerByUserId(lecturerId);
                String assignmentTitle = assessment.getAssessmentName();


                String studentName = "Sinh viên " + studentId;


                String submissionId = submission.getId();


                try {
                    notificationClient.notifyHomeworkSubmitted(
                            studentId, lecturerResponse.getUserId(), courseId, submissionId, studentName, assignmentTitle
                    );
                } catch (Exception e) {
                    System.err.println("Lỗi khi gửi thông báo nộp bài: " + e.getMessage());
                }
            }

            return ResponseEntity.ok(submission);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi nộp bài: " + e.getMessage()));
        }
    }

    @PostMapping("/offerings/{offeringId}/assessments")
    public ResponseEntity<?> createAssessment(
            @RequestHeader("X-User-Id") String lecturerId,
            @PathVariable String offeringId,
            @RequestParam("assessmentName") String assessmentName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value="weight" , required = false ) Float weight,
            @RequestParam("assessmentType") String assessmentType,
            @RequestParam("endTime") String endTimeStr,
            @RequestParam(value = "rubricId", required = false) String rubricId,

            @RequestParam(value = "cloIds", required = false) List<String> cloIds,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        try {
            AssessmentLecturerResponse createdAssessment = assessmentService.createAssessment(
                    offeringId, assessmentName, description, weight, assessmentType,
                    endTimeStr, rubricId, cloIds, file
            );

            List<String> studentIds = enrollmentRepository.findStudentIdsByOfferingId(offeringId);

            try {
                if (studentIds != null && !studentIds.isEmpty()) {

                    notificationClient.notifyHomeworkAssignedToMultipleStudents(
                            studentIds,
                            lecturerId,
                            offeringId,
                            createdAssessment.getAssessmentId(),
                            assessmentName
                    );
                }
            } catch (Exception e) {
                System.err.println("Lỗi khi gửi thông báo: " + e.getMessage());
            }

            return ResponseEntity.ok(createdAssessment);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo bài tập: " + e.getMessage());
        }
    }

    @GetMapping("/offerings/{offeringId}/assessments-list")
    public ResponseEntity<List<AssessmentLecturerResponse>> getAssessmentsByOffering(@PathVariable String offeringId) {
        List<AssessmentLecturerResponse> list = assessmentService.getAssessmentsByOfferingId(offeringId);
        return ResponseEntity.ok(list);
    }

    @PutMapping("/assessments/{assessmentId}")
    public ResponseEntity<?> updateAssessment(
            @RequestHeader("X-User-Id") String lecturerId,
            @PathVariable String assessmentId,
            @RequestParam("assessmentName") String assessmentName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "weight", required = false) Float weight,
            @RequestParam("assessmentType") String assessmentType,
            @RequestParam("endTime") String endTimeStr,
            @RequestParam(value = "rubricId", required = false) String rubricId,
            @RequestParam(value = "cloIds", required = false) List<String> cloIds,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        try {
            AssessmentLecturerResponse response = assessmentService.updateAssessment(
                    assessmentId, assessmentName, description, weight, assessmentType,
                    endTimeStr, rubricId, cloIds, file
            );

            Assessment assessment = assessmentRepository.findById(assessmentId).orElse(null);
            if (assessment != null && assessment.getCourseOffering() != null) {

                String offeringId = assessment.getCourseOffering().getOfferingId();


                List<String> studentIds = enrollmentRepository.findStudentIdsByOfferingId(offeringId);

                try {
                    if (studentIds != null && !studentIds.isEmpty()) {

                        notificationClient.notifyHomeworkUpdatedToMultipleStudents(
                                studentIds,
                                lecturerId,
                                offeringId,
                                assessmentId,
                                assessmentName
                        );
                    }
                } catch (Exception e) {
                    System.err.println("Lỗi khi gửi thông báo cập nhật bài tập: " + e.getMessage());
                }
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Lỗi: " + e.getMessage()
            ));
        }
    }

    @DeleteMapping(value = "/assessments/{assessmentId}", produces = "application/json")
    public ResponseEntity<?> deleteAssessment(@PathVariable String assessmentId) {
        try {

            assessmentService.deleteAssessment(assessmentId);


            try {
                notificationClient.deleteNotificationsByLinkedResource(assessmentId);
            } catch (Exception e) {
                System.err.println("Lỗi khi gọi API xóa thông báo liên quan: " + e.getMessage());
            }

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