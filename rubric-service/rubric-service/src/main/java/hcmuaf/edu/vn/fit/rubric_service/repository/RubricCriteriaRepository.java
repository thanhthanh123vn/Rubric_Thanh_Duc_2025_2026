package hcmuaf.edu.vn.fit.rubric_service.repository;

import hcmuaf.edu.vn.fit.rubric_service.entity.RubricCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RubricCriteriaRepository extends JpaRepository<RubricCriteria, String> {
}
