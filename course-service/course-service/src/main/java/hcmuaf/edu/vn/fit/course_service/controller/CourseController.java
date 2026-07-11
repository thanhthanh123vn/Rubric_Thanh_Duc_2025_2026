package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.CourseRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.*;
import hcmuaf.edu.vn.fit.course_service.service.CourseService;
import hcmuaf.edu.vn.fit.course_service.service.OBEService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
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
    public ResponseEntity<?> enroll(
            @RequestParam(required = false) String studentId,
            @RequestParam String offeringId) {
        try {
            String targetStudentId = (studentId != null && !studentId.trim().isEmpty()) ? studentId : "";
            service.enroll(targetStudentId, offeringId);
            return ResponseEntity.ok("Thêm sinh viên thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/enroll")
    public ResponseEntity<?> unenroll(
            @RequestParam String studentId,
            @RequestParam String offeringId) {
        try {
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

    @GetMapping("/offering/{offeringId}/OBE")
    public ResponseEntity<List<OBEProgressResponse>> getOBEProgress(
            @PathVariable String offeringId,
            @RequestHeader("X-User-Id") String studentId) {
        return ResponseEntity.ok(obeService.getOBEProgressByStudentId(offeringId, studentId));
    }


    @PostMapping("/{courseId}/assign-lecturers")
    public ResponseEntity<CourseOfferingResponse> assignLecturers(
            @PathVariable String courseId,
            @RequestBody Map<String, List<String>> requestBody) {


        List<String> lecturerIds = requestBody.get("lecturerIds");

        if (lecturerIds == null || lecturerIds.isEmpty()) {
            throw new IllegalArgumentException("Danh sách giảng viên (lecturerIds) không được để trống!");
        }

        return ResponseEntity.ok(service.assignLecturers(courseId, lecturerIds));
    }

    @GetMapping("/teacher/me/dashboard")
    public ResponseEntity<List<DashboardCourseResponse>> getTeacherDashboardCourses(@RequestHeader("X-User-Id") String userId) {
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
