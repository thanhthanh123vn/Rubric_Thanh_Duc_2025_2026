package hcmuaf.edu.vn.fit.user_service.controller;

import hcmuaf.edu.vn.fit.user_service.dto.response.DepartmentResponse;
import hcmuaf.edu.vn.fit.user_service.entity.Department;
import hcmuaf.edu.vn.fit.user_service.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user-service/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<List<DepartmentResponse>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<List<DepartmentResponse>> getDepartmentsByFaculty(@PathVariable String facultyId) {
        return ResponseEntity.ok(departmentService.getDepartmentsByFaculty(facultyId));
    }

    @PostMapping
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        return ResponseEntity.ok(departmentService.createDepartment(department));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Department> updateDepartment(@PathVariable String id, @RequestBody Department department) {
        return ResponseEntity.ok(departmentService.updateDepartment(id, department));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable String id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }



}