package hcmuaf.edu.vn.fit.user_service.repository;

import hcmuaf.edu.vn.fit.user_service.entity.Lecturer;
import hcmuaf.edu.vn.fit.user_service.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;
import java.util.Optional;

public interface LecturerRepository extends JpaRepository<Lecturer, String> {
    Optional<Lecturer> findByUser_UserId(String userId);
    Page<Lecturer> findByFullNameContainingIgnoreCase(String keyword, Pageable pageable);
    List<Lecturer> findByDepartment_Faculty_FacultyName(String facultyName);
    Optional<Lecturer> findByUser(User user);
    @Query("SELECT l.user.userId FROM Lecturer l WHERE l.lecturerId = :lecturerId")
    Optional<String> findUserIdById(@Param("lecturerId") String lecturerId);
    List<Lecturer> findByDepartment_DepartmentName(String departmentName);
    Long countLecturerByDepartment_departmentName(String department);
}
