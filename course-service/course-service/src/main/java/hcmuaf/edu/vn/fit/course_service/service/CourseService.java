package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.CourseRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.*;
import hcmuaf.edu.vn.fit.course_service.entity.Course;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.Enrollment;
import hcmuaf.edu.vn.fit.course_service.entity.SyllabusFile;
import hcmuaf.edu.vn.fit.course_service.mapper.CourseMapper;
import hcmuaf.edu.vn.fit.course_service.mapper.SyllabusFileMapper;
import hcmuaf.edu.vn.fit.course_service.mapper.SyllarbusMapper;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.EnrollmentRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.SyllabusFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepo;
    private final S3Service s3Service;
    private final UserClient userClient;
    private final EnrollmentRepository enrollmentRepo;
    private final CourseOfferingRepository courseOfferingRepo;
    private final CourseMapper courseMapper;
    private final SyllarbusMapper syllarbusMapper;
    private final SyllabusFileMapper syllabusFileMapper;
    private final SyllabusFileRepository syllabusFileRepository;

    public Page<CourseResponse> getAllCourses(String keyword, Pageable pageable) {
        Page<Course> courses;

        if (keyword != null && !keyword.trim().isEmpty()) {
            courses = courseRepo.findByCourseNameContainingIgnoreCaseOrCourseIdContainingIgnoreCase(keyword, keyword, pageable);
        } else {
            courses = courseRepo.findAll(pageable);
        }

        return courses.map(courseMapper::toCourseResponse);
    }
    public List<CourseResponse> getAllCoursesNoPage() {
        List<Course> courses =  courseRepo.findAll();

        return courses.stream()
                .map(courseMapper::toCourseResponse)
                .toList();
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

        // Chuyển đổi lấy danh sách Lecturer
        List<LecturerInfo> lecturerInfos = new ArrayList<>();
        if (offering.getLecturerIds() != null && !offering.getLecturerIds().isEmpty()) {
            for (String lId : offering.getLecturerIds()) {
                try {
                    LecturerResponse lecturer = userClient.getLecturer(lId);
                    lecturerInfos.add(new LecturerInfo(lId, lecturer.getFullName()));
                } catch (Exception e) {
                    lecturerInfos.add(new LecturerInfo(lId, "Unknown Lecturer"));
                }
            }
        }

        response.setLecturers(lecturerInfos);
        response.setYear(offering.getAcademicYear());

        return response;
    }

    public List<SyllabusFileDTO> getSyllabusForCourse(String offeringId) {
        CourseOffering offering = courseOfferingRepo.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Course Offering not found"));
        Course course = offering.getCourse();

        return syllarbusMapper.toResponseList(course.getSyllabusFiles());
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
        // Lấy enrollments trực tiếp để xử lý danh sách giảng viên linh hoạt hơn
        List<Enrollment> enrollments = enrollmentRepo.findByStudentId(studentId);

        return enrollments.stream().map(enrollment -> {
            CourseOffering offering = enrollment.getCourseOffering();
            Course course = offering.getCourse();

            DashboardCourseResponse res = new DashboardCourseResponse();
            res.setOfferingId(offering.getOfferingId());
            res.setCourseCode(course != null ? course.getCourseCode() : "");
            res.setCourseName(course != null ? course.getCourseName() : "Môn học không xác định");
            res.setCredits(course != null ? course.getCredits() : 0);
            res.setSemester(offering.getSemester());
            res.setAcademicYear(offering.getAcademicYear());

            // Lấy tên giảng viên đầu tiên làm đại diện cho Dashboard Student
            String primaryLecturerName = "Unknown Lecturer";
            if (offering.getLecturerIds() != null && !offering.getLecturerIds().isEmpty()) {
                try {
                    String firstLecturerId = offering.getLecturerIds().get(0);
                    LecturerResponse lecturer = userClient.getLecturer(firstLecturerId);

                    primaryLecturerName = lecturer.getFullName();
                    // Nếu có nhiều GV, có thể thêm đuôi "... và những người khác"
                    if (offering.getLecturerIds().size() > 1) {
                        primaryLecturerName += " (+ " + (offering.getLecturerIds().size() - 1) + ")";
                    }
                } catch (Exception e) {
                    primaryLecturerName = "Unknown Lecturer";
                }
            }
            res.setLecturerName(primaryLecturerName);

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

    public void unenroll(String studentId, String offeringId) {
        Enrollment existing = enrollmentRepo.findByStudentIdAndCourseOffering_OfferingId(studentId, offeringId)
                .orElseThrow(() -> new IllegalArgumentException("Sinh viên chưa đăng ký hoặc không tồn tại trong lớp học phần này!"));

        enrollmentRepo.delete(existing);
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

    @Transactional
    public List<SyllabusFileDTO> uploadSyllabus(String courseId, List<MultipartFile> files) {
        CourseOffering offering = courseOfferingRepo.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Học phần"));
        Course course = courseRepo.findById(offering.getCourse().getCourseId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học!"));

        if (course.getSyllabusFiles() == null) {
            course.setSyllabusFiles(new ArrayList<>());
        }

        List<CompletableFuture<SyllabusFile>> futures = files.stream()
                .map(file -> CompletableFuture.supplyAsync(() -> {
                    try {
                        String fileUrl = s3Service.uploadFile(file);

                        SyllabusFile syllabusFile = new SyllabusFile();
                        syllabusFile.setFileUrl(fileUrl);
                        syllabusFile.setFileName(file.getOriginalFilename());
                        syllabusFile.setCourse(course);

                        return syllabusFile;
                    } catch (IOException e) {
                        throw new RuntimeException("Upload file thất bại: " + file.getOriginalFilename(), e);
                    }
                }))
                .collect(Collectors.toList());

        List<SyllabusFile> uploadedFiles = futures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toList());

        uploadedFiles = syllabusFileRepository.saveAll(uploadedFiles);

        course.getSyllabusFiles().addAll(uploadedFiles);
        courseRepo.save(course);

        return syllabusFileMapper.toResponseList(uploadedFiles);
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



    public CourseOfferingResponse assignLecturers(String offeringId, List<String> lecturerIds) {


        CourseOffering offering = courseOfferingRepo.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Lớp học phần với ID: " + offeringId));


        Course course = offering.getCourse();
        String courseDept = course.getDepartment();


        if (lecturerIds != null && !lecturerIds.isEmpty()) {
            for (String lId : lecturerIds) {
                try {
                    LecturerResponse lecturer = userClient.getLecturer(lId);
                    if (lecturer == null) {
                        throw new RuntimeException("Giảng viên ID " + lId + " không tồn tại trong hệ thống!");
                    }

                    String lecturerDept = lecturer.getDepartment();
                    if (courseDept != null && !courseDept.equalsIgnoreCase(lecturerDept)) {
                        throw new IllegalArgumentException("Giảng viên " + lecturer.getFullName() +
                                " thuộc bộ môn [" + lecturerDept + "], không được phép dạy môn của bộ môn [" + courseDept + "]!");
                    }
                } catch (IllegalArgumentException e) {
                    throw e;
                } catch (Exception e) {
                    throw new RuntimeException("Lỗi kết nối tới User Service hoặc không tìm thấy GV ID: " + lId);
                }
            }
        }



        offering.setLecturerIds(lecturerIds);



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

        // TÌM CÁC LỚP MÀ GV NÀY NẰM TRONG DANH SÁCH LECTURER_IDS
        List<CourseOffering> offerings = courseOfferingRepo.findByLecturerIdsContaining(lecturer.getLecturerId());

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

            res.setLecturerName(lecturerName); // Hiện tên user đang login cho dashboard của họ
            return res;
        }).collect(Collectors.toList());
    }

    public List<TeacherCourseResponse> getTeacherCourses(String userId) {
        List<CourseOffering> offerings = new ArrayList<>();
        String lecturerName = "Unknown Lecturer";

        try {
            LecturerResponse lecturer = userClient.getLecturerByUserId(userId);
            if (lecturer != null) {
                // TÌM CÁC LỚP MÀ GV NÀY NẰM TRONG DANH SÁCH LECTURER_IDS
                offerings = courseOfferingRepo.findByLecturerIdsContaining(lecturer.getLecturerId());
                lecturerName = lecturer.getFullName();
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi gọi UserClient lấy thông tin giảng viên: " + e.getMessage());
        }

        final String finalLecturerName = lecturerName;

        return offerings.stream().map(offering -> {
            int studentCount = enrollmentRepo.countByCourseOffering_OfferingId(offering.getOfferingId());

            return TeacherCourseResponse.builder()
                    .courseId(offering.getCourse().getCourseId())
                    .offeringId(offering.getOfferingId())
                    .courseCode(offering.getCourse().getCourseCode())
                    .courseName(offering.getCourse().getCourseName())
                    .courseTitle(offering.getCourse().getCourseName())
                    .semester(offering.getSemester() + " " + offering.getAcademicYear()) // Sửa lại cho linh hoạt
                    .studentCount(studentCount)
                    .obeProgress(0)
                    .lecturerName(finalLecturerName)
                    .status(offering.getStatus())
                    .startDate(offering.getStartDate() != null ? offering.getStartDate().toString() : null)
                    .endDate(offering.getEndDate() != null ? offering.getEndDate().toString() : null)
                    .build();
        }).collect(Collectors.toList());
    }
    public List<CourseResponse> getCoursesByDepartment(String department) {
        List<Course> courses = courseRepo.findByDepartment(department);
        return courses.stream()
                .map(courseMapper::toCourseResponse)
                .collect(Collectors.toList());
    }
}
