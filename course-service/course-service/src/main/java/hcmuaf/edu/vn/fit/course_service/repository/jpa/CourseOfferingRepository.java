package hcmuaf.edu.vn.fit.course_service.repository.jpa;

import hcmuaf.edu.vn.fit.course_service.dto.response.DashboardCourseAdmin;
import hcmuaf.edu.vn.fit.course_service.dto.response.DashboardCourseProjection;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository

public interface CourseOfferingRepository extends JpaRepository<CourseOffering, String> {

//    List<CourseOffering> findByLecturerId(String lecturerId);

    List<CourseOffering> findByCourse_CourseId(String courseId);

    @Query("SELECT c FROM CourseOffering c JOIN c.lecturerIds l WHERE l = :lecturerId")
    List<CourseOffering> findByLecturerIdsContaining(@Param("lecturerId") String lecturerId);

    List<CourseOffering> findByCourse_CourseIdIn(Set<String> courseIds);
    @Query("""
    SELECT
        co.offeringId AS offeringId,
        co.offeringName AS courseName,
        COUNT(e.enrollmentId) AS studentCount
    FROM CourseOffering co
    LEFT JOIN Enrollment e
        ON e.courseOffering.offeringId = co.offeringId
    GROUP BY co.offeringId, co.offeringName
    ORDER BY COUNT(e.enrollmentId) DESC
""")
    List<DashboardCourseAdmin> getCourseAllocations(Pageable pageable);


}