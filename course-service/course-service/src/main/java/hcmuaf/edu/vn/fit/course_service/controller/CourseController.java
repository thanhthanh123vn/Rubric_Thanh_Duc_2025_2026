package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.client.ClientIpUtil;
import hcmuaf.edu.vn.fit.course_service.dto.request.CourseRequest;
import hcmuaf.edu.vn.fit.course_service.dto.request.GradebookConfigRequest;
import hcmuaf.edu.vn.fit.course_service.dto.request.GradebookScoreRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.*;
import hcmuaf.edu.vn.fit.course_service.service.CourseService;
import hcmuaf.edu.vn.fit.course_service.service.GradebookService;
import hcmuaf.edu.vn.fit.course_service.service.OBEService;
import hcmuaf.edu.vn.fit.course_service.service.SystemLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/course-service/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService service;
    private final OBEService obeService;
    private final GradebookService gradebookService;
    private final SystemLogService systemLogService;


    @GetMapping
    public ResponseEntity<Page<CourseResponse>> getAllCourses(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "courseId") String sortBy) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return ResponseEntity.ok(service.getAllCourses(keyword, pageable));
    }
    @GetMapping("/all")
    public ResponseEntity<List<CourseResponse>> getAllCourses() {

        return ResponseEntity.ok(service.getAllCoursesNoPage());
    }
    @GetMapping("/offering/{offeringId}/course")
    public CourseOfferingResponse getCourseByOfferingId(@PathVariable String offeringId) {
        return service.getCourseOffering(offeringId);
    }


    @PostMapping
    public ResponseEntity<CourseResponse> create(
            @RequestHeader("X-User-Id") String userId,

            @RequestBody CourseRequest request,
            HttpServletRequest httpServletRequest) {
        if(userId==null) return ResponseEntity.status(401).build();

        try {
            String ip = ClientIpUtil.getClientIp(httpServletRequest);
            String username = httpServletRequest.getHeader("X-User-Username");

            systemLogService.writeLog(
                    "INFO",
                    "CREATE_COURSE",
                    "Tạo khóa học thành công",
                    username,
                    ip
            );

            return ResponseEntity.ok(service.createCourse(request));

        } catch (Exception e) {

            String ip = ClientIpUtil.getClientIp(httpServletRequest);

            systemLogService.writeLog(
                    "ERROR",
                    "CREATE_COURSE_FAILED",
                    "Lỗi khi tạo khóa học: " + e.getMessage(),
                    userId,
                    ip
            );

            throw new RuntimeException("Có lỗi xảy ra, vui lòng thử lại sau!");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> update(@RequestHeader("X-User-Id") String userId ,@PathVariable String id, @RequestBody CourseRequest request,
    HttpServletRequest httpRequest) {
        if(userId==null) return ResponseEntity.status(401).build();
        try {
            String ip = ClientIpUtil.getClientIp(httpRequest);
            String userName = httpRequest.getHeader("X-User-Username");

            systemLogService.writeLog(
                    "INFO",
                    "UPDATE_COURSE",
                    "Cập Nhập khóa học thành công",
                    userName,
                    ip
            );

        } catch (Exception e) {
            String ip = ClientIpUtil.getClientIp(httpRequest);

            String userName = httpRequest.getHeader("X-User-Username");
            systemLogService.writeLog(
                    "ERROR",
                    "UPDATE_COURSE_FAILED",
                    "Lỗi khi cập nhập khóa học: " + e.getMessage(),
                    userName,
                    ip
            );


            throw new RuntimeException("Có lỗi xảy ra, vui lòng thử lại sau!");
        }

        return ResponseEntity.ok(service.updateCourse(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@RequestHeader("X-user-Id") String userId,@PathVariable String id,
                                         HttpServletRequest httpRequest) {
        if(userId==null) return ResponseEntity.status(401).build();
        service.deleteCourse(id);
        try {
            String ip = ClientIpUtil.getClientIp(httpRequest);
            String userName = httpRequest.getHeader("X-User-Username");

            systemLogService.writeLog(
                    "INFO",
                    "DELETE_COURSE",
                    "Xóa khóa học thành công",
                    userName,
                    ip
            );

        } catch (Exception e) {
            String ip = ClientIpUtil.getClientIp(httpRequest);
            String userName = httpRequest.getHeader("X-User-Username");
            systemLogService.writeLog(
                    "ERROR",
                    "DELETE_COURSE_FAILED",
                    "Lỗi khi  xóa khóa học: " + e.getMessage(),
                    userName,
                    ip
            );


            throw new RuntimeException("Có lỗi xảy ra, vui lòng thử lại sau!");
        }


        return ResponseEntity.ok("Đã xóa khóa học thành công!");
    }

    @PostMapping("/enroll")
    public ResponseEntity<?> enroll(
            @RequestParam(required = false) String studentId,
            @RequestParam String offeringId,
            HttpServletRequest httpRequest) {
        try {
            String targetStudentId = (studentId != null && !studentId.trim().isEmpty()) ? studentId : "";
            String ip = ClientIpUtil.getClientIp(httpRequest);
            String userName = httpRequest.getHeader("X-User-Username");
            systemLogService.writeLog(
                    "INFO",
                    "ENROLL_COURSE",
                    "Đăng ký sinh viên vào khóa học  thành công",
                    userName,
                    ip
            );

            service.enroll(targetStudentId, offeringId);
            return ResponseEntity.ok("Thêm sinh viên thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/enroll")
    public ResponseEntity<?> unenroll(
            @RequestParam String studentId,
            @RequestParam String offeringId,
            HttpServletRequest httpRequest
            ) {
        if(studentId==null) return ResponseEntity.status(401).build();
        try {
            String ip = ClientIpUtil.getClientIp(httpRequest);
            String userName = httpRequest.getHeader("X-User-Username");
            systemLogService.writeLog(
                    "INFO",
                    "UNERROLL_COURSE",
                    "Xóa  sinh viên vào khóa học  thành công",
                    userName,
                    ip
            );

            service.unenroll(studentId, offeringId);
            return ResponseEntity.ok("Xóa sinh viên khỏi lớp học phần thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping(value ="/{courseId}/upload-syllabus", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<SyllabusFileDTO>> uploadSyllabus(
            @PathVariable String courseId,
            @RequestParam("files") List<MultipartFile> files) {
        try {
            System.out.println("đã vào backend upload nhiều file");
            List<SyllabusFileDTO> uploadedFiles = service.uploadSyllabus(courseId, files);
            return ResponseEntity.ok(uploadedFiles);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/student/me/dashboard")
    public List<DashboardCourseResponse> getStudentDashboardCourses(@RequestHeader("X-User-Id") String studentId) {
        return service.getDashboardCoursesForStudent(studentId);
    }

    @GetMapping("/offering/{offeringId}/students")
    public ResponseEntity<List<StudentCourseResponse>> getStudentsByOffering(@PathVariable String offeringId) {
        return ResponseEntity.ok(service.getStudentsByOfferingId(offeringId));
    }

    @GetMapping("/offering/{offeringId}/gradebook")
    public ResponseEntity<CourseGradebookResponse> getGradebook(@PathVariable String offeringId) {
        return ResponseEntity.ok(gradebookService.getGradebook(offeringId));
    }

    @PutMapping("/offering/{offeringId}/gradebook/config")
    public ResponseEntity<CourseGradebookResponse> updateGradebookConfig(
            @PathVariable String offeringId,
            @RequestBody GradebookConfigRequest request) {
        return ResponseEntity.ok(gradebookService.updateConfig(offeringId, request));
    }

    @PutMapping("/offering/{offeringId}/gradebook/scores")
    public ResponseEntity<CourseGradebookResponse> updateGradebookScores(
            @PathVariable String offeringId,
            @RequestBody List<GradebookScoreRequest> requests) {
        return ResponseEntity.ok(gradebookService.updateScores(offeringId, requests));
    }

    @PostMapping(value = "/offering/{offeringId}/gradebook/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> importGradebook(
            @PathVariable String offeringId,
            @RequestParam("file") MultipartFile file) throws Exception {
        return ResponseEntity.ok(gradebookService.importExcel(offeringId, file));
    }

    @GetMapping("/offering/{offeringId}/gradebook/template")
    public ResponseEntity<byte[]> downloadGradebookTemplate(@PathVariable String offeringId) throws Exception {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=gradebook-" + offeringId + ".xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(gradebookService.createTemplate(offeringId));
    }

    @GetMapping("/offering/{offeringId}/OBE")
    public ResponseEntity<List<OBEProgressResponse>> getOBEProgress(
            @PathVariable String offeringId,
            @RequestHeader("X-User-Id") String studentId) {
        return ResponseEntity.ok(obeService.getOBEProgressByStudentId(offeringId, studentId));
    }


    @PostMapping("/{courseId}/assign-lecturers")
    public ResponseEntity<CourseOfferingResponse> assignLecturers(
            @RequestHeader ("X-User-Id") String userId,
            @PathVariable String courseId,
            @RequestBody Map<String, List<String>> requestBody,
            HttpServletRequest httpServletRequest) {
        if(userId ==null) return ResponseEntity.badRequest().build();


        List<String> lecturerIds = requestBody.get("lecturerIds");

        if (lecturerIds == null || lecturerIds.isEmpty()) {
            throw new IllegalArgumentException("Danh sách giảng viên (lecturerIds) không được để trống!");
        }
        try{
            String ip = ClientIpUtil.getClientIp(httpServletRequest);
            String userName = httpServletRequest.getHeader("X-User-Username");
            systemLogService.writeLog(
                    "INFO",
                    "Assign Lecturers",
                    "Gán Giảng viên vào khóa học",
                    userName,
                    ip
            );

        } catch (Exception e) {
            String ip = ClientIpUtil.getClientIp(httpServletRequest);
            String userName = httpServletRequest.getHeader("X-User-Username");
            systemLogService.writeLog(
                    "ERROR",
                    "Assign Lecturers",
                    "Lỗi khi gán Giảng viên vào khóa học: " + e.getMessage(),
                    userName,
                    ip
            );


            throw new RuntimeException("Có lỗi xảy ra, vui lòng thử lại sau!");
        }

        return ResponseEntity.ok(service.assignLecturers(courseId, lecturerIds));
    }

    @GetMapping("/teacher/me/dashboard")
    public ResponseEntity<List<DashboardCourseResponse>> getTeacherDashboardCourses(@RequestHeader("X-User-Id") String userId) {
        System.out.println(userId);

        return ResponseEntity.ok(service.getDashboardCoursesForTeacher(userId));
    }

    @GetMapping("/lecturer/me/dashboard")
    public ResponseEntity<List<TeacherCourseResponse>> getTeacherCourses(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(service.getTeacherCourses(userId));
    }

    @GetMapping("/{offeringId}/syllabusFiles")
    public ResponseEntity<List<SyllabusFileDTO>> getSyllaBusFilesInCourse(
            @PathVariable String offeringId) {
        return ResponseEntity.ok(service.getSyllabusForCourse(offeringId));
    }
    @GetMapping("/department/{department}")
    public ResponseEntity<List<CourseResponse>> getCoursesByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(service.getCoursesByDepartment(department));
    }
}
