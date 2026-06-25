package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.entity.SyllabusFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SyllabusFileRepository extends JpaRepository<SyllabusFile, String> {
    List<SyllabusFile> findByCourse_CourseId(String courseId);

}
