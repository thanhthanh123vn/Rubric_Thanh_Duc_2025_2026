package hcmuaf.edu.vn.fit.rubric_service.repository;

import hcmuaf.edu.vn.fit.rubric_service.entity.CourseCloEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CourseCloMappingCleanupRepository extends JpaRepository<CourseCloEntity, String> {
    @Modifying
    @Query(value = "DELETE FROM db_course.clo_plo_mapping WHERE clo_id = :cloId", nativeQuery = true)
    void deletePloMappings(@Param("cloId") String cloId);
}
