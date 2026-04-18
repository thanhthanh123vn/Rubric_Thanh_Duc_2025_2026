package hcmuaf.edu.vn.fit.course_service.controller;

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

    @Autowired
    private CourseService service;

    @GetMapping
    public List<Course> getAll() {
        return service.getAllCourses();
    }

    @PostMapping
    public Course create(@RequestBody Course course) {
        return service.createCourse(course);
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