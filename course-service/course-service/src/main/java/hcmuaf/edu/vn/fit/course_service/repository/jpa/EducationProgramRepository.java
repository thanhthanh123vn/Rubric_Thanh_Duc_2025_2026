package hcmuaf.edu.vn.fit.course_service.repository.jpa;

import hcmuaf.edu.vn.fit.course_service.entity.EducationProgram;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EducationProgramRepository extends JpaRepository<EducationProgram, String> {
    Optional<EducationProgram> findByProgramCodeIgnoreCase(String programCode);
}
