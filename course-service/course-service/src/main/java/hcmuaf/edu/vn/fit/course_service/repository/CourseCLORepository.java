package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.entity.AssessmentCLO;
import hcmuaf.edu.vn.fit.course_service.entity.CourseCLO;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseCLORepository extends JpaRepository<CourseCLO, String> {
}
