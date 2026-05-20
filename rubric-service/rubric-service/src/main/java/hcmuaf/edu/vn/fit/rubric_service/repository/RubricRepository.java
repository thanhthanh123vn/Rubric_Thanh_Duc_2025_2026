package hcmuaf.edu.vn.fit.rubric_service.repository;

import hcmuaf.edu.vn.fit.rubric_service.entity.Rubric;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RubricRepository extends JpaRepository<Rubric, String> {

    @EntityGraph(attributePaths = {
            "criteria",
            "criteria.levels"
    })
    List<Rubric> findAllByOrderByRubricNameAsc();

    @EntityGraph(attributePaths = {
            "criteria",
            "criteria.levels"
    })
    Optional<Rubric> findWithCriteriaAndLevelsByRubricId(String rubricId);
}