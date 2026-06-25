package hcmuaf.edu.vn.fit.rubric_service.repository;

import hcmuaf.edu.vn.fit.rubric_service.entity.CourseCloMapEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseCloMapRepository extends JpaRepository<CourseCloMapEntity, Long> {
    List<CourseCloMapEntity> findByClo_CloId(String cloId);

    void deleteByClo_CloId(String cloId);
}
