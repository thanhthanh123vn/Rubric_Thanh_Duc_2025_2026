package hcmuaf.edu.vn.fit.user_service.repository;

import hcmuaf.edu.vn.fit.user_service.entity.HeadOfDepartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HeadOfDepartmentRepository extends JpaRepository<HeadOfDepartment, Long> {


    Optional<HeadOfDepartment> findByDepartment_DepartmentIdAndStatus(String departmentId, String status);
}