package hcmuaf.edu.vn.fit.grading_service.repository;
import hcmuaf.edu.vn.fit.grading_service.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GradeRepository extends JpaRepository<Grade, Long> {

}