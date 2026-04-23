package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.response.AssessmentDetailResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.AssessmentReponse;
import hcmuaf.edu.vn.fit.course_service.service.AssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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
}
