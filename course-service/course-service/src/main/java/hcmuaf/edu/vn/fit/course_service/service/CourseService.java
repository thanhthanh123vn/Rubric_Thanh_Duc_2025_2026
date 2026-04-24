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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    public Page<CourseResponse> getAllCourses(String keyword, Pageable pageable) {
        Page<Course> courses;


        if (keyword != null && !keyword.trim().isEmpty()) {
            courses = courseRepo.findByCourseNameContainingIgnoreCaseOrCourseIdContainingIgnoreCase(keyword, keyword, pageable);
        } else {
            courses = courseRepo.findAll(pageable);
        }


        return courses.map(courseMapper::toCourseResponse);

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
    public CourseOfferingResponse assignLecturer(String courseId, String lecturerId) {
        // 1. Tìm Course gốc
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học với ID: " + courseId));

        // 2. Kiểm tra Giảng viên
        LecturerResponse lecturer = null;
        try {
            lecturer = userClient.getLecturer(lecturerId);
            if (lecturer == null) {
                throw new RuntimeException("Giảng viên không tồn tại trong hệ thống!");
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi kết nối tới User Service hoặc không tìm thấy GV!");
        }



        String courseDept = course.getDepartment();
        String lecturerDept = lecturer.getDepartment();

        if (courseDept != null && !courseDept.equalsIgnoreCase(lecturerDept)) {
            throw new IllegalArgumentException("Giảng viên " + lecturer.getFullName() +
                    " thuộc bộ môn [" + lecturerDept + "], không được phép dạy môn của bộ môn [" + courseDept + "]!");
        }



        CourseOffering offering = new CourseOffering();
        offering.setOfferingId("CO-" + System.currentTimeMillis());
        offering.setCourse(course);
        offering.setLecturerId(lecturerId);

        CourseOffering savedOffering = courseOfferingRepo.save(offering);
        return courseMapper.toResponse(savedOffering);
    }

    public List<DashboardCourseResponse> getDashboardCoursesForTeacher(String userId) {
        LecturerResponse lecturer = null;


        try {
            lecturer = userClient.getLecturerByUserId(userId);
            if (lecturer == null || lecturer.getLecturerId() == null) {
                return List.of();
            }
        } catch (Exception e) {
            System.err.println("Lỗi lấy thông tin giảng viên: " + e.getMessage());
            return List.of();
        }


        List<CourseOffering> offerings = courseOfferingRepo.findByLecturerId(lecturer.getLecturerId());


        final String lecturerName = lecturer.getFullName();
        final String academicTitle = lecturer.getAcademicTitle();
        return offerings.stream().map(offering -> {
            DashboardCourseResponse res = new DashboardCourseResponse();
            res.setOfferingId(offering.getOfferingId());
            res.setCourseCode(offering.getCourse() != null ? offering.getCourse().getCourseCode() : "");
            res.setCourseName(offering.getCourse() != null ? offering.getCourse().getCourseName() : "Môn học không xác định");
            res.setCredits(offering.getCourse() != null ? offering.getCourse().getCredits() : 0);

            res.setAcademicTitle(academicTitle);
             res.setSemester(offering.getSemester());
             res.setAcademicYear(offering.getAcademicYear());

            res.setLecturerName(lecturerName);
            return res;
        }).collect(Collectors.toList());
    }
    public List<TeacherCourseResponse> getTeacherCourses(String userId) {

        List<CourseOffering> offerings = courseOfferingRepo.findByLecturerId(userId);


        String lecturerName = "Unknown Lecturer";
        try {
            LecturerResponse lecturer = userClient.getLecturerByUserId(userId);
            if (lecturer != null) {
                offerings = courseOfferingRepo.findByLecturerId(lecturer.getLecturerId());
                lecturerName = lecturer.getFullName();
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi gọi UserClient lấy thông tin giảng viên: " + e.getMessage());
        }

        final String finalLecturerName = lecturerName;


        return offerings.stream().map(offering -> {
            long studentCount = enrollmentRepo.countByCourseOffering_OfferingId(offering.getOfferingId());

            return TeacherCourseResponse.builder()
                    .offeringId(offering.getOfferingId())
                    .courseCode(offering.getCourse().getCourseCode())
                    .courseName(offering.getCourse().getCourseName())
                    .courseTitle(offering.getCourse().getCourseName())
                    .semester("HK1 " + offering.getAcademicYear())
                    .studentCount(studentCount)
                    .obeProgress(0)
                    .lecturerName(finalLecturerName)
                    .build();
        }).collect(Collectors.toList());
    }
}