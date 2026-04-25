package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.service.CourseService;
import hcmuaf.edu.vn.fit.course_service.service.OBEService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/course-service/obe")
@RequiredArgsConstructor
public class OBEController {

    private final OBEService obeService;

    @GetMapping("/teacher/offering/{offeringId}")
    public ResponseEntity<?> getOBEForLecturer(
            @PathVariable String offeringId
    ){
        return ResponseEntity.ok(obeService.getOBEForLecturer(offeringId));
    }
}
