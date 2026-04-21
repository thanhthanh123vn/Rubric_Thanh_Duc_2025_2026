package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.response.AssessmentDetailResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.AssessmentReponse;
import hcmuaf.edu.vn.fit.course_service.service.AssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/course-service")
public class AssessmentController {

    @Autowired
    private AssessmentService assessmentService;

    @GetMapping("/offerings/{offeringId}/assessments")
    public List<AssessmentReponse> getAssignments(
            @PathVariable String offeringId
    ) {
        return assessmentService.getAssByCourseOffering(offeringId, "22130050");
    }

    // detail
    @GetMapping("/assessments/{assessmentId}")
    public AssessmentDetailResponse getAssignmentDetail(
            @PathVariable String assessmentId
    ) {
        return assessmentService.getAssById(assessmentId, "22130050");
    }
}
