package hcmuaf.edu.vn.fit.course_service.repository.jpa;

import hcmuaf.edu.vn.fit.course_service.entity.AttendanceLegend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface AttendanceLegendRepository extends JpaRepository<AttendanceLegend, String> {
    List<AttendanceLegend> findByOfferingIdOrderByCreatedAtAsc(String offeringId);
}
