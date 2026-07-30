package hcmuaf.edu.vn.fit.user_service.repository;

import hcmuaf.edu.vn.fit.user_service.entity.Department;
import hcmuaf.edu.vn.fit.user_service.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, String> {
    List<Department> findByFaculty_FacultyId(String facultyId);
    Optional<Department> findByDepartmentName(String departmentName);

    @Query("SELECT d.departmentName FROM Department d WHERE d.faculty.facultyName = :facultyName")
    List<String> findDepartmentNamesByFacultyName(@Param("facultyName") String facultyName);
}