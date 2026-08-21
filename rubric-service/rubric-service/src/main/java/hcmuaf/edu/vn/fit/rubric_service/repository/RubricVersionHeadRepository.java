package hcmuaf.edu.vn.fit.rubric_service.repository;

import hcmuaf.edu.vn.fit.rubric_service.entity.RubricVersionHead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RubricVersionHeadRepository extends JpaRepository<RubricVersionHead, String> {
    Optional<RubricVersionHead> findByRootRubricIdAndLecturerId(String rootRubricId, String lecturerId);

    List<RubricVersionHead> findByLecturerId(String lecturerId);
}
