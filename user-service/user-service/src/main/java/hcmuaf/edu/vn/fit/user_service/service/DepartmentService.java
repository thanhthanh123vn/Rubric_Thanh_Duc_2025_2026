package hcmuaf.edu.vn.fit.user_service.service;

import hcmuaf.edu.vn.fit.user_service.dto.response.DepartmentResponse;
import hcmuaf.edu.vn.fit.user_service.entity.Department;
import hcmuaf.edu.vn.fit.user_service.entity.Faculty;
import hcmuaf.edu.vn.fit.user_service.repository.DepartmentRepository;
import hcmuaf.edu.vn.fit.user_service.repository.FacultyRepository;
import hcmuaf.edu.vn.fit.user_service.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final FacultyRepository facultyRepository;

    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<DepartmentResponse> getDepartmentsByFaculty(String facultyId) {
        return departmentRepository.findByFaculty_FacultyId(facultyId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Department createDepartment(Department department) {
        // Kiểm tra xem Khoa có tồn tại không
        if (department.getFaculty() != null) {
            Faculty faculty = facultyRepository.findById(department.getFaculty().getFacultyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khoa không tồn tại"));
            department.setFaculty(faculty);
        }
        return departmentRepository.save(department);
    }

    public Department updateDepartment(String id, Department departmentDetails) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Bộ môn: " + id));

        department.setDepartmentName(departmentDetails.getDepartmentName());

        if (departmentDetails.getFaculty() != null) {
            Faculty faculty = facultyRepository.findById(departmentDetails.getFaculty().getFacultyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khoa không tồn tại"));
            department.setFaculty(faculty);
        }

        return departmentRepository.save(department);
    }

    public void deleteDepartment(String id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy Bộ môn: " + id);
        }
        departmentRepository.deleteById(id);
    }

    private DepartmentResponse mapToResponse(Department d) {
        return new DepartmentResponse(
                d.getDepartmentId(),
                d.getDepartmentName(),
                d.getFaculty() != null ? d.getFaculty().getFacultyId() : null,
                d.getFaculty() != null ? d.getFaculty().getFacultyName() : null
        );
    }
}