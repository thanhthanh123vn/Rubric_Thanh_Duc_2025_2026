package hcmuaf.edu.vn.fit.course_service.repository;
import hcmuaf.edu.vn.fit.course_service.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
}