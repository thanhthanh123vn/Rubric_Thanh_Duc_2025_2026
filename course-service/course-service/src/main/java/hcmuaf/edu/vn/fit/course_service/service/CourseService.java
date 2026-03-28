package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.entity.Course;
import hcmuaf.edu.vn.fit.course_service.entity.Enrollment;
import hcmuaf.edu.vn.fit.course_service.repository.CourseRepository;
import hcmuaf.edu.vn.fit.course_service.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepo;

    @Autowired
    private EnrollmentRepository enrollmentRepo;

    public List<Course> getAllCourses() {
        return courseRepo.findAll();
    }

    public Course createCourse(Course course) {
        return courseRepo.save(course);
    }

    public Enrollment enroll(Long studentId, Long courseId) {
        Enrollment e = new Enrollment();
        e.setStudentId(studentId);
        e.setCourseId(courseId);
        return enrollmentRepo.save(e);
    }

    public List<Enrollment> getStudentCourses(Long studentId) {
        return enrollmentRepo.findByStudentId(studentId);
    }
}