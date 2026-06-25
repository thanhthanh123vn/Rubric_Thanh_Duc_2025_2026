package hcmuaf.edu.vn.fit.user_service.repository;

import hcmuaf.edu.vn.fit.user_service.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, String> {
    List<Department> findByFaculty_FacultyId(String facultyId);
}