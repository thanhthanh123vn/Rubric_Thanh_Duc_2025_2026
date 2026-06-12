package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.CourseOfferingRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.CourseOfferingResponse;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.service.CourseOfferingService;
import hcmuaf.edu.vn.fit.course_service.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/course-service/courses-offering")
public class CourseOfferingController {
   private final CourseOfferingService courseOfferingService;
    @PostMapping("/{courseId}/offerings")
    public ResponseEntity<CourseOfferingResponse> createCourseOffering(
            @PathVariable String courseId,
            @RequestBody CourseOfferingRequest request) {

        return new ResponseEntity<>(courseOfferingService.createOffering(courseId, request), HttpStatus.CREATED);
    }

    @GetMapping("/{courseId}/offerings")
    public ResponseEntity<CourseOfferingResponse> getOfferingsByCourse(@PathVariable String courseId) {
        return ResponseEntity.ok(courseOfferingService.getOfferingById(courseId));
    }
    @GetMapping("/offerings")
    public ResponseEntity<List<CourseOfferingResponse>> getOfferings() {
        return ResponseEntity.ok(courseOfferingService.getOfferings());
    }

}
