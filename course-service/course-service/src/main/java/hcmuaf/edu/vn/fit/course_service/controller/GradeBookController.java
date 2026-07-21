package hcmuaf.edu.vn.fit.course_service.controller;

import com.cloudinary.api.ApiResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.CourseGradebookResponse;
import hcmuaf.edu.vn.fit.course_service.service.GradebookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/course-service/offerings")
@RequiredArgsConstructor
public class GradeBookController {
    private final GradebookService gradebookService;
    @GetMapping("/{offeringId}/gradebook")
    public ResponseEntity<CourseGradebookResponse> getGradebookByOffering(
            @PathVariable String offeringId) {

        CourseGradebookResponse gradebook = gradebookService.getGradebook(offeringId);
        return ResponseEntity.ok(gradebook);

    }
}
