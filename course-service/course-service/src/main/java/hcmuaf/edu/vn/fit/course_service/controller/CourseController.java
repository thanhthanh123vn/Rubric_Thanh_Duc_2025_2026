package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.CourseRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.*;
import hcmuaf.edu.vn.fit.course_service.entity.Course;
import hcmuaf.edu.vn.fit.course_service.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/course-service/courses")
@RequiredArgsConstructor
public class CourseController {


    private final CourseService service;


    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAll() {
        return ResponseEntity.ok(service.getAllCourses());
    }
    @GetMapping("/offering/{offeringId}/course")
    public CourseOfferingResponse getCourseByOfferingId(@PathVariable String offeringId) {
        return service.getCourseOfferingDetail(offeringId);
    }
    @PostMapping
    public ResponseEntity<CourseResponse> create(@RequestBody CourseRequest request) {
        return ResponseEntity.ok(service.createCourse(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> update(@PathVariable String id, @RequestBody CourseRequest request) {
        return ResponseEntity.ok(service.updateCourse(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable String id) {
        service.deleteCourse(id);
        return ResponseEntity.ok("Đã xóa khóa học thành công!");
    }
    @PostMapping("/enroll")
    public Object enroll(
            @RequestHeader("X-User-Id") String studentId,
            @RequestParam String offeringId) {
        try {
            return service.enroll(studentId, offeringId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/student/me/dashboard")
    public List<DashboardCourseProjection> getStudentDashboardCourses(@RequestHeader("X-User-Id") String studentId) {
        return service.getDashboardCoursesForStudent(studentId);
    }

    @GetMapping("/offering/{offeringId}/students")
    public ResponseEntity<List<StudentCourseProjection>> getStudentsByOffering(@PathVariable String offeringId) {
        return ResponseEntity.ok(service.getStudentsByOfferingId(offeringId));
    }
    @GetMapping("/offering/{offeringId}/OBE")
    public ResponseEntity<List<OBEProgressResponse>> getOBEProgress(@PathVariable String offeringId) {
        return ResponseEntity.ok(service.getOBEProgress(offeringId));
    }
}