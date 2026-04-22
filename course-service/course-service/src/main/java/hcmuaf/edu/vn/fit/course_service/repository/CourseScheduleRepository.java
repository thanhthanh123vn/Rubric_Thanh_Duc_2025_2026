package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.entity.CourseSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CourseScheduleRepository extends JpaRepository<CourseSchedule, String> {
    @Query("SELECT cs FROM CourseSchedule cs " +
                  "JOIN cs.courseOffering co " +
                  "JOIN Enrollment e ON e.courseOffering = co " +
                  "WHERE e.studentId = :studentId " +
                  "AND e.status = 'ACTIVE'") 
    List<CourseSchedule> findSchedulesByStudentId(@Param("studentId") String studentId);
}
