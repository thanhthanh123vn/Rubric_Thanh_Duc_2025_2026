package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByStudentId(Long studentId);
    Optional<Enrollment> findByStudentIdAndCourseOffering_OfferingId(String studentId, String offeringId);
}