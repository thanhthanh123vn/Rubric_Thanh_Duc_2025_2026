package hcmuaf.edu.vn.fit.course_service.repository;
import hcmuaf.edu.vn.fit.course_service.dto.response.OBEProgressResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {
    boolean existsByCourseCode(String courseCode);

    @Query(value = """
    SELECT 
        c.clo_id AS cloId,
        c.clo_code AS cloCode,
        c.description AS cloDescription,

        SUM(rc.weight) AS totalWeight,

        SUM(rr.calculated_score) AS achievedScore,

        ROUND(
            (SUM(rr.calculated_score) / NULLIF(SUM(rc.weight), 0)) * 100,
            2
        ) AS progressPercent

    FROM course_offerings co

    JOIN assessments a 
        ON a.offering_id = co.offering_id

    JOIN assessment_clo ac 
        ON ac.assessment_id = a.assessment_id

    JOIN course_clo c 
        ON c.clo_id = ac.clo_id

    LEFT JOIN rubric_criteria rc 
        ON rc.clo_id = c.clo_id

    LEFT JOIN rubric_results rr 
        ON rr.criteria_id = rc.criteria_id

    WHERE co.offering_id = :offeringId

    GROUP BY c.clo_id, c.clo_code, c.description
""", nativeQuery = true)
    List<Object[]> getOBEByOffering(@Param("offeringId") String offeringId);



    Page<Course> findByCourseNameContainingIgnoreCaseOrCourseIdContainingIgnoreCase(String courseName, String courseId, Pageable pageable);
}