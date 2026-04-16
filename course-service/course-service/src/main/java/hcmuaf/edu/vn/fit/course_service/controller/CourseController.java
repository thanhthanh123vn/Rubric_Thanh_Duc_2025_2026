package hcmuaf.edu.vn.fit.course_service.controller;
import hcmuaf.edu.vn.fit.course_service.entity.Course;
import hcmuaf.edu.vn.fit.course_service.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
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

//    @PostMapping("/enroll")
//    public Object enroll(
//            @RequestParam Long studentId,
//            @RequestParam Long courseId) {
//        return service.enroll(studentId, courseId);
//    }

    @GetMapping("/student/{studentId}")
    public List<?> getStudentCourses(@PathVariable Long studentId) {
        return service.getStudentCourses(studentId);
    }
}