package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.entity.AttendanceSession;
import hcmuaf.edu.vn.fit.course_service.entity.enums.AttendanceSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, String> {
    List<AttendanceSession> findByOfferingIdOrderByCreatedAtDesc(String offeringId);
    Optional<AttendanceSession> findFirstByOfferingIdAndStatusOrderByEndTimeDesc(
            String offeringId,
            AttendanceSessionStatus status
    );
}
