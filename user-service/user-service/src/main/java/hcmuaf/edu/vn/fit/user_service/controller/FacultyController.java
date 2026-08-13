package hcmuaf.edu.vn.fit.user_service.controller;

import hcmuaf.edu.vn.fit.user_service.dto.response.FacultyResponse;
import hcmuaf.edu.vn.fit.user_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.user_service.entity.Faculty;
import hcmuaf.edu.vn.fit.user_service.service.DepartmentService;
import hcmuaf.edu.vn.fit.user_service.service.FacultyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user-service/faculties")
@RequiredArgsConstructor
public class FacultyController {

    private final FacultyService facultyService;
    private final DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<List<FacultyResponse>> getAllFaculties() {
        return ResponseEntity.ok(facultyService.getAllFaculties());
    }

    @PostMapping
    public ResponseEntity<Faculty> createFaculty(@RequestBody Faculty faculty) {
        return ResponseEntity.ok(facultyService.createFaculty(faculty));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Faculty> updateFaculty(@PathVariable String id, @RequestBody Faculty faculty) {
        return ResponseEntity.ok(facultyService.updateFaculty(id, faculty));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFaculty(@PathVariable String id) {
        facultyService.deleteFaculty(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/{facultyName}")
    public ResponseEntity<List<LecturerResponse>> getLecturersByFaculty(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable String facultyName) {

        if(userId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<LecturerResponse> lecturers = facultyService.getLecturersByFaculty(facultyName);
        return ResponseEntity.ok(lecturers);
    }
    @GetMapping("/department/{departmentName}")
    public ResponseEntity<FacultyResponse> getFacultyByDepartment(@RequestHeader("X-User-Id")String userId,
            @PathVariable String departmentName
    ){
        if(userId == null) {
            return ResponseEntity.badRequest().build();
        }

        FacultyResponse faculty = departmentService.getFacultyByDepartmentName(departmentName);
        return ResponseEntity.ok(faculty);


    }
    @GetMapping("/{facultyName}/departments")
    public ResponseEntity<List<String>> getDepartmentNamesByFaculty(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable String facultyName) {

        if(userId == null) {
            return ResponseEntity.badRequest().build();
        }

        // Gọi sang DepartmentService để lấy danh sách tên
        List<String> departmentNames = departmentService.getDepartmentNamesByFaculty(facultyName);
        return ResponseEntity.ok(departmentNames);
    }
}