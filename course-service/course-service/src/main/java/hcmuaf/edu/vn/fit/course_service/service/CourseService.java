package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.CourseRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.*;
import hcmuaf.edu.vn.fit.course_service.entity.Course;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.Enrollment;
import hcmuaf.edu.vn.fit.course_service.mapper.CourseMapper;
import hcmuaf.edu.vn.fit.course_service.repository.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.CourseRepository;
import hcmuaf.edu.vn.fit.course_service.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {


    private final CourseRepository courseRepo;

    private final UserClient userClient;
    private final EnrollmentRepository enrollmentRepo;
    private final CourseOfferingRepository courseOfferingRepo;
    private final CourseMapper courseMapper;

    public List<CourseResponse> getAllCourses() {
        return courseRepo.findAll().stream()
                .map(courseMapper::toCourseResponse)
                .collect(Collectors.toList());
    }

    public CourseResponse getCourseByOfferingId(String offeringId) {
        CourseOffering offering = courseOfferingRepo.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học phần với ID: " + offeringId));
        return courseMapper.toCourseResponse(offering.getCourse());
    }

    public CourseOfferingResponse getCourseOffering(String offeringId) {
        CourseOffering offering = courseOfferingRepo.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Course Offering not found"));

        CourseOfferingResponse response = courseMapper.toResponse(offering);

        try {
            if (response.getLecturerId() != null) {
                System.out.println(response.getLecturerId());
                LecturerResponse lecturer =  userClient.getLecturer(response.getLecturerId());
                System.out.println(lecturer);
                response.setLecturerName(lecturer.getFullName());
                response.setYear(offering.getAcademicYear());


            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setLecturerName("Unknown Lecturer");
        }

        return response;
    }

    public CourseResponse createCourse(CourseRequest request) {
        if (courseRepo.existsByCourseCode(request.getCourseCode())) {
            throw new RuntimeException("Mã môn học đã tồn tại!");
        }

        Course course = courseMapper.toCourse(request);
        course.setCourseId("C" + System.currentTimeMillis());

        Course savedCourse = courseRepo.save(course);
        return courseMapper.toCourseResponse(savedCourse);
    }

    public CourseResponse updateCourse(String id, CourseRequest request) {
        Course course = courseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học với ID: " + id));

        // Mapper tự động lấy dữ liệu từ request đổ vào course
        courseMapper.updateCourseFromRequest(request, course);

        Course updatedCourse = courseRepo.save(course);
        return courseMapper.toCourseResponse(updatedCourse);
    }

    public void deleteCourse(String id) {
        Course course = courseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học với ID: " + id));
        courseRepo.delete(course);
    }

    public List<Enrollment> getStudentCourses(String studentId) {

        return enrollmentRepo.findByStudentId(studentId);
    }

    public List<DashboardCourseResponse> getDashboardCoursesForStudent(String studentId) {
        List<DashboardCourseProjection> projections = enrollmentRepo.findDashboardCoursesByUserId(studentId);

        return projections.stream().map(p -> {
            DashboardCourseResponse res = new DashboardCourseResponse();
            res.setOfferingId(p.getOfferingId());
            res.setCourseCode(p.getCourseCode());
            res.setCourseName(p.getCourseName());
            res.setCredits(p.getCredits());
            res.setSemester(p.getSemester());
            res.setAcademicYear(p.getAcademicYear());


            try {
                if (p.getLecturerId() != null) {
                    LecturerResponse lecturer = userClient.getLecturer(p.getLecturerId());
                    res.setLecturerName(lecturer.getFullName());
                }
            } catch (Exception e) {
                res.setLecturerName("Unknown Lecturer");
            }

            return res;
        }).collect(Collectors.toList());
    }

    public Enrollment enroll(String studentId, String offeringId) {

        Optional<Enrollment> existing = enrollmentRepo.findByStudentIdAndCourseOffering_OfferingId(studentId, offeringId);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Sinh viên đã đăng ký lớp học phần này!");
        }


        validateUser(studentId);

        CourseOffering offering = courseOfferingRepo.findById(offeringId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học phần với ID: " + offeringId));


        Enrollment newEnrollment = Enrollment.builder()
                .studentId(studentId)
                .courseOffering(offering)
                .build();

        return enrollmentRepo.save(newEnrollment);
    }

    public List<StudentCourseResponse> getStudentsByOfferingId(String offeringId) {

        List<Enrollment> enrollments = enrollmentRepo.findByCourseOffering_OfferingId(offeringId);


        return enrollments.stream().map(enroll -> {
            StudentCourseResponse response = new StudentCourseResponse();
            response.setStudentId(enroll.getStudentId());
            response.setEnrollmentDate(enroll.getEnrollmentDate());

            try {

                SinhVienResponse sv = userClient.getSinhVien(enroll.getStudentId());
                if (sv != null) {
                    response.setFullName(sv.getFullName());
                    response.setEmail(sv.getEmail());
                }
            } catch (Exception e) {

                response.setFullName("Unknown Student");

            }

            return response;
        }).collect(Collectors.toList());
    }

    public List<OBEProgressResponse> getOBEProgress(String offeringId) {
        List<Object[]> rows = courseRepo.getOBEByOffering(offeringId);

        return rows.stream().map(r -> new OBEProgressResponse(
                (String) r[0],
                (String) r[1],
                (String) r[2],
                r[3] != null ? ((Number) r[3]).doubleValue() : 0,
                r[4] != null ? ((Number) r[4]).doubleValue() : 0,
                r[5] != null ? ((Number) r[5]).doubleValue() : 0
        )).toList();
    }
    private void validateUser(String userId) {
        try {
            SinhVienResponse user = userClient.getSinhVien(userId);

            if (user == null) {
                throw new RuntimeException("User không tồn tại");
            }

        } catch (Exception e) {
            throw new RuntimeException("User không hợp lệ");
        }
    }
}