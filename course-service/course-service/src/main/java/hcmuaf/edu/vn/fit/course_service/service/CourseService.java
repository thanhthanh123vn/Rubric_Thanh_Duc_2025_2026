package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.response.DashboardCourseProjection;
import hcmuaf.edu.vn.fit.course_service.dto.response.DashboardCourseResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Course;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.Enrollment;
import hcmuaf.edu.vn.fit.course_service.entity.User;
import hcmuaf.edu.vn.fit.course_service.repository.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.CourseRepository;
import hcmuaf.edu.vn.fit.course_service.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepo;

    @Autowired
    private EnrollmentRepository enrollmentRepo;
    @Autowired
    private  CourseOfferingRepository courseOfferingRepo;

    public List<Course> getAllCourses() {
        return courseRepo.findAll();
    }

    public Course createCourse(Course course) {
        return courseRepo.save(course);
    }


    public List<Enrollment> getStudentCourses(String studentId) {
        return enrollmentRepo.findByStudent_UserId(studentId);
    }


    public List<DashboardCourseProjection> getDashboardCoursesForStudent(String studentId) {
        return enrollmentRepo.findDashboardCoursesByUserId(studentId);
    }
    public Enrollment enroll(String studentId, String offeringId) {
        // 1. Kiểm tra xem sinh viên đã đăng ký lớp học này chưa
        Optional<Enrollment> existing = enrollmentRepo.findByStudent_UserIdAndCourseOffering_OfferingId(studentId, offeringId);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Sinh viên đã đăng ký lớp học phần này!");
        }

        // 2. Tìm lớp học phần
        CourseOffering offering = courseOfferingRepo.findById(offeringId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học phần với ID: " + offeringId));


        User studentRef = new User();
        studentRef.setUserId(studentId); 

        Enrollment newEnrollment = Enrollment.builder()
                .student(studentRef)
                .courseOffering(offering)
                .build();

        return enrollmentRepo.save(newEnrollment);
    }
}