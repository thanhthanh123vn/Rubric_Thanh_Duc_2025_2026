package hcmuaf.edu.vn.fit.rubric_service.repository;

import hcmuaf.edu.vn.fit.rubric_service.entity.CourseCloEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface CourseCloRepository
        extends JpaRepository<CourseCloEntity, String> {
    Optional<CourseCloEntity> findByCloCode(String cloCode);
}
