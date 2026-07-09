package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, String> {
    boolean existsBySessionIdAndStudentId(String sessionId, String studentId);
    Optional<Attendance> findBySessionIdAndStudentId(String sessionId, String studentId);
    List<Attendance> findByStudentIdAndOfferingIdOrderByCheckinTimeDesc(String studentId, String offeringId);
    List<Attendance> findBySessionIdOrderByCheckinTimeAsc(String sessionId);
    List<Attendance> findByOfferingId(String offeringId);
    List<Attendance> findByOfferingIdAndStudentId(String offeringId, String studentId);
    long countBySessionId(String sessionId);
}
