package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.dto.response.DashboardCourseProjection;
import hcmuaf.edu.vn.fit.course_service.dto.response.DashboardCourseResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.StudentCourseProjection;
import hcmuaf.edu.vn.fit.course_service.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

import hcmuaf.edu.vn.fit.course_service.entity.Enrollment;
import org.springframework.stereotype.Repository;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, String> {
    List<Enrollment> findByStudent_UserId(String userId);


    Optional<Enrollment> findByStudent_UserIdAndCourseOffering_OfferingId(String userId, String offeringId);

    @Query(value = "SELECT " +
            "co.offering_id AS offeringId, " +
            "c.course_code AS courseCode, " +
            "c.course_name AS courseName, " +
            "c.credits AS credits, " +
            "co.semester AS semester, " +
            "co.academic_year AS academicYear, " +
            "l.full_name AS fullName " +
            "FROM enrollments e " +
            "JOIN course_offerings co ON e.offering_id = co.offering_id COLLATE utf8mb4_unicode_520_ci " +
            "JOIN courses c ON co.course_id = c.course_id COLLATE utf8mb4_unicode_520_ci " +
            "JOIN lecturers l ON co.lecturer_id = l.lecturer_id COLLATE utf8mb4_unicode_520_ci " +
            "JOIN sinh_vien s ON e.student_id = s.student_id COLLATE utf8mb4_unicode_520_ci " +
            "WHERE s.user_id = :userId COLLATE utf8mb4_unicode_520_ci " +
            "  AND e.status = 'ACTIVE' COLLATE utf8mb4_unicode_520_ci",
            nativeQuery = true)
    List<DashboardCourseProjection> findDashboardCoursesByUserId(@Param("userId") String userId);
    @Query(value = "SELECT " +
            "u.user_id AS id, " +
            "s.full_name AS fullName, " +
            "u.email AS email " +
            "FROM enrollments e " +
            "JOIN sinh_vien s ON e.student_id = s.student_id COLLATE utf8mb4_unicode_520_ci " +
            "JOIN users u ON s.user_id = u.user_id COLLATE utf8mb4_unicode_520_ci " +
            "WHERE e.offering_id = :offeringId COLLATE utf8mb4_unicode_520_ci " +
            "AND e.status = 'ACTIVE' COLLATE utf8mb4_unicode_520_ci",
            nativeQuery = true)
    List<StudentCourseProjection> findStudentsByOfferingId(@Param("offeringId") String offeringId);
}