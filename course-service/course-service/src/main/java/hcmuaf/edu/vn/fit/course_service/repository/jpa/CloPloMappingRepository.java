package hcmuaf.edu.vn.fit.course_service.repository.jpa;

import hcmuaf.edu.vn.fit.course_service.entity.CloPloMapping;
import hcmuaf.edu.vn.fit.course_service.entity.CloPloMappingId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface CloPloMappingRepository extends JpaRepository<CloPloMapping, CloPloMappingId> {
    List<CloPloMapping> findByIdCloIdIn(Collection<String> cloIds);
    void deleteByIdCloIdIn(Collection<String> cloIds);
}
