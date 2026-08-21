package hcmuaf.edu.vn.fit.rubric_service.repository;

import hcmuaf.edu.vn.fit.rubric_service.entity.CourseCloEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface CourseCloRepository
        extends JpaRepository<CourseCloEntity, String> {
    List<CourseCloEntity> findByCourseIdOrderByCloCodeAsc(String courseId);

    Optional<CourseCloEntity> findByCourseIdAndCloCode(String courseId, String cloCode);

    Optional<CourseCloEntity> findByCourseIdAndCloCodeAndCloIdNot(String courseId, String cloCode, String cloId);
}
