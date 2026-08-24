package hcmuaf.edu.vn.fit.course_service.repository.jpa;

import hcmuaf.edu.vn.fit.course_service.entity.ProgramPlo;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProgramPloRepository extends JpaRepository<ProgramPlo, String> {
    @EntityGraph(attributePaths = "courseClos")
    List<ProgramPlo> findByProgramProgramIdOrderByPloCodeAsc(String programId);

    Optional<ProgramPlo> findByProgramProgramIdAndPloCodeIgnoreCase(String programId, String ploCode);
}
