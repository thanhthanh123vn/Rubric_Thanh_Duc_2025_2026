package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.CourseRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.CourseResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.DashboardCourseProjection;
import hcmuaf.edu.vn.fit.course_service.dto.response.DashboardCourseResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Course;
import hcmuaf.edu.vn.fit.course_service.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CourseController {


    private final CourseService service;


    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAll() {
        return ResponseEntity.ok(service.getAllCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.getCourseById(id));
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
            @RequestParam String studentId,
            @RequestParam String offeringId) {
        try {
            return service.enroll(studentId, offeringId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/student/{studentId}/dashboard")
    public List<DashboardCourseProjection> getStudentDashboardCourses(@PathVariable String studentId) {
        return service.getDashboardCoursesForStudent(studentId);
    }
}