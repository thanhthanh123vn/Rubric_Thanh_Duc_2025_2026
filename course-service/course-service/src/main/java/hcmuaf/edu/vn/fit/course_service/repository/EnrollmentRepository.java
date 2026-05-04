package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.dto.response.DashboardCourseProjection;
import hcmuaf.edu.vn.fit.course_service.dto.response.StudentCourseProjection;
import hcmuaf.edu.vn.fit.course_service.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, String> {

    // 1. Sửa lại thành studentId (Vì trong Enrollment đổi thành String studentId)
    List<Enrollment> findByStudentId(String studentId);
    int countByCourseOffering_OfferingId(String offeringId);
    // 2. Sửa lại thành studentId
    Optional<Enrollment> findByStudentIdAndCourseOffering_OfferingId(String studentId, String offeringId);

    // 3. Xóa JOIN tới bảng lecturers và sinh_vien
    @Query(value = "SELECT " +
            "co.offering_id AS offeringId, " +
            "c.course_code AS courseCode, " +
            "c.course_name AS courseName, " +
            "c.credits AS credits, " +
            "co.semester AS semester, " +
            "co.academic_year AS academicYear, " +
            "co.lecturer_id AS lecturerId " + // Lấy mã giảng viên thay vì tên
            "FROM enrollments e " +
            "JOIN course_offerings co ON e.offering_id = co.offering_id COLLATE utf8mb4_unicode_520_ci " +
            "JOIN courses c ON co.course_id = c.course_id COLLATE utf8mb4_unicode_520_ci " +
            "WHERE e.student_id = :userId COLLATE utf8mb4_unicode_520_ci " + // So sánh trực tiếp với student_id
            "  AND e.status = 'ACTIVE' COLLATE utf8mb4_unicode_520_ci",
            nativeQuery = true)
    List<DashboardCourseProjection> findDashboardCoursesByUserId(@Param("userId") String userId);

    List<Enrollment> findByCourseOffering_OfferingId(String offeringId);
    @Query(value = "SELECT " +
            "e.student_id AS id " + // Chỉ lấy được ID của sinh viên
            "FROM enrollments e " +
            "WHERE e.offering_id = :offeringId COLLATE utf8mb4_unicode_520_ci " +
            "AND e.status = 'ACTIVE' COLLATE utf8mb4_unicode_520_ci",
            nativeQuery = true)
    List<StudentCourseProjection> findStudentsByOfferingId(@Param("offeringId") String offeringId);
    @Query(value = "SELECT e.student_id FROM enrollments e " +
            "WHERE e.offering_id = :offeringId COLLATE utf8mb4_unicode_520_ci " +
            "AND e.status = 'ACTIVE' COLLATE utf8mb4_unicode_520_ci",
            nativeQuery = true)
    List<String> findStudentIdsByOfferingId(@Param("offeringId") String offeringId);
}