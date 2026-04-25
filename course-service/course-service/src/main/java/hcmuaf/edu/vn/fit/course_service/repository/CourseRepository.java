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

    JOIN submissions sub 
        ON sub.assessment_id = a.assessment_id

    JOIN students s 
        ON s.student_id = sub.student_id

    JOIN assessment_clo ac 
        ON ac.assessment_id = a.assessment_id

    JOIN course_clo c 
        ON c.clo_id = ac.clo_id

    LEFT JOIN rubric_criteria rc 
        ON rc.clo_id = c.clo_id

    LEFT JOIN rubric_results rr 
        ON rr.criteria_id = rc.criteria_id 
        AND rr.submission_id = sub.submission_id

    WHERE co.offering_id = :offeringId
      AND s.student_id = :studentId

    GROUP BY c.clo_id, c.clo_code, c.description
""", nativeQuery = true)
    List<Object[]> getOBEByOfferingByStudent(
            @Param("offeringId") String offeringId,
            @Param("studentId") String studentId
    );

    @Query(value = """
        SELECT 
            c.clo_id,
            c.clo_code,
            c.description,

            ROUND(
                SUM(rr.calculated_score) / NULLIF(SUM(rc.weight), 0) * 100,
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


    @Query(value = """
        SELECT 
            c.clo_id,
            s.student_id,
            s.full_name,

            ROUND(
                SUM(rr.calculated_score) / NULLIF(SUM(rc.weight), 0) * 100,
                2
            ) AS progressPercent

        FROM students s

        JOIN submissions sub 
            ON sub.student_id = s.student_id

        JOIN assessments a 
            ON a.assessment_id = sub.assessment_id

        JOIN assessment_clo ac 
            ON ac.assessment_id = a.assessment_id

        JOIN course_clo c 
            ON c.clo_id = ac.clo_id

        LEFT JOIN rubric_criteria rc 
            ON rc.clo_id = c.clo_id

        LEFT JOIN rubric_results rr 
            ON rr.criteria_id = rc.criteria_id 
            AND rr.submission_id = sub.submission_id

        WHERE a.offering_id = :offeringId

        GROUP BY c.clo_id, s.student_id, s.full_name
    """, nativeQuery = true)
    List<Object[]> getAllStudentOBE(@Param("offeringId") String offeringId);


    // 🔵 3. Distribution theo CLO (cho chart)
    @Query(value = """
        SELECT 
            t.clo_id,
            CASE 
                WHEN t.score < 40 THEN '0-40'
                WHEN t.score < 70 THEN '40-70'
                ELSE '70-100'
            END AS range_label,
            COUNT(*) AS total_students

        FROM (
            SELECT 
                c.clo_id,
                s.student_id,

                SUM(rr.calculated_score) / NULLIF(SUM(rc.weight), 0) * 100 AS score

            FROM students s

            JOIN submissions sub 
                ON sub.student_id = s.student_id

            JOIN assessments a 
                ON a.assessment_id = sub.assessment_id

            JOIN assessment_clo ac 
                ON ac.assessment_id = a.assessment_id

            JOIN course_clo c 
                ON c.clo_id = ac.clo_id

            LEFT JOIN rubric_criteria rc 
                ON rc.clo_id = c.clo_id

            LEFT JOIN rubric_results rr 
                ON rr.criteria_id = rc.criteria_id 
                AND rr.submission_id = sub.submission_id

            WHERE a.offering_id = :offeringId

            GROUP BY c.clo_id, s.student_id
        ) t

        GROUP BY t.clo_id, range_label
    """, nativeQuery = true)
    List<Object[]> getDistributionByOffering(@Param("offeringId") String offeringId);






    Page<Course> findByCourseNameContainingIgnoreCaseOrCourseIdContainingIgnoreCase(String courseName, String courseId, Pageable pageable);

}