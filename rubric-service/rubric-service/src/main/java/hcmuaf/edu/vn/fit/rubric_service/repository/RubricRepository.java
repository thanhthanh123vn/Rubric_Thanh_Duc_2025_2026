package hcmuaf.edu.vn.fit.rubric_service.repository;

import hcmuaf.edu.vn.fit.rubric_service.entity.Rubric;
import hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    List<Rubric> findByStatus(RubricStatus status);

    @Query("SELECT r FROM Rubric r WHERE r.status = :status AND r.courseId IN :courseIds")
    List<Rubric> findByStatusAndCourseIdsIn(@Param("status") RubricStatus status, @Param("courseIds") List<String> courseIds);
}
