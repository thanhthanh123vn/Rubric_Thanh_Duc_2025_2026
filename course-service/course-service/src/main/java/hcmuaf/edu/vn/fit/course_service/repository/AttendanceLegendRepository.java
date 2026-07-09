package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.entity.AttendanceLegend;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttendanceLegendRepository extends JpaRepository<AttendanceLegend, String> {
    List<AttendanceLegend> findByOfferingIdOrderByCreatedAtAsc(String offeringId);
}
