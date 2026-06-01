package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.entity.CourseCLO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseCLORepository extends JpaRepository<CourseCLO, String> {


    @Query("SELECT c FROM CourseCLO c WHERE c.course.courseId = :courseId AND c.cloCode IN :cloCodes")
    List<CourseCLO> findByCourseIdAndCloCodes(@Param("courseId") String courseId, @Param("cloCodes") List<String> cloCodes);
    List<CourseCLO> findByCloCodeIn( List<String> cloCodes);
}