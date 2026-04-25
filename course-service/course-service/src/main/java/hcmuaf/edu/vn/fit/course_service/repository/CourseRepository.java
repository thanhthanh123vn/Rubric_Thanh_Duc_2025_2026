package hcmuaf.edu.vn.fit.course_service.repository;

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

    // =========================================================
    // 1. STUDENT OBE PROGRESS BY CLO (FIXED)
    // =========================================================
    @Query(value = """
    SELECT 
        c.clo_id AS cloId,
        c.clo_code AS cloCode,
        c.description AS cloDescription,

        ROUND(SUM(COALESCE(rr.calculated_score, 0)), 2) AS achievedScore,

        SUM(rc.weight) AS totalWeight,

        ROUND(
            SUM(COALESCE(rr.calculated_score, 0)) 
            / NULLIF(SUM(rc.weight), 0) * 100,
            2
        ) AS progressPercent

    FROM course_offerings co

    JOIN assessments a 
        ON a.offering_id = co.offering_id

    JOIN submissions sub 
        ON sub.assessment_id = a.assessment_id

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
      AND sub.student_id = :studentId

    GROUP BY c.clo_id, c.clo_code, c.description
    """, nativeQuery = true)
    List<Object[]> getOBEByOfferingByStudent(
            @Param("offeringId") String offeringId,
            @Param("studentId") String studentId
    );

    // =========================================================
    // 2. LECTURER CLO PROGRESS (FIXED)
    // =========================================================
    @Query(value = """
    SELECT 
        c.clo_id,
        c.clo_code,
        c.description,

        ROUND(SUM(COALESCE(rr.calculated_score, 0)), 2) AS achievedScore,

        SUM(rc.weight) AS totalWeight,

        ROUND(
            SUM(COALESCE(rr.calculated_score, 0)) 
            / NULLIF(SUM(rc.weight), 0) * 100,
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

    // =========================================================
    // 3. STUDENT SCORE BY CLO (FIXED)
    // =========================================================
    @Query(value = """
    SELECT 
        s.student_id,
        s.full_name,

        ROUND(SUM(COALESCE(rr.calculated_score, 0)), 2) AS score

    FROM enrollments e

    JOIN students s 
        ON s.student_id = e.student_id

    JOIN submissions sub 
        ON sub.student_id = s.student_id

    JOIN assessments a 
        ON a.assessment_id = sub.assessment_id
        AND a.offering_id = e.offering_id

    JOIN assessment_clo ac 
        ON ac.assessment_id = a.assessment_id

    JOIN course_clo c 
        ON c.clo_id = ac.clo_id

    LEFT JOIN rubric_results rr 
        ON rr.submission_id = sub.submission_id

    LEFT JOIN rubric_criteria rc 
        ON rc.criteria_id = rr.criteria_id
        AND rc.clo_id = c.clo_id

    WHERE e.offering_id = :offeringId
      AND c.clo_id = :cloId

    GROUP BY s.student_id, s.full_name
    """, nativeQuery = true)
    List<Object[]> getStudentScoresByCLO(
            @Param("offeringId") String offeringId,
            @Param("cloId") String cloId
    );

    // =========================================================
    // 4. DISTRIBUTION BY SCORE RANGE (FIXED REAL DATA)
    // =========================================================
    @Query(value = """
    SELECT 
        t.clo_id,
        CASE 
            WHEN t.score IS NULL THEN 'NOT_ASSESSED'
            WHEN t.score < 40 THEN '0-40'
            WHEN t.score < 70 THEN '40-70'
            ELSE '70-100'
        END AS range_label,
        COUNT(*) AS total_students

    FROM (
        SELECT 
            c.clo_id,
            s.student_id,

            ROUND(SUM(COALESCE(rr.calculated_score, 0)), 2) AS score

        FROM students s

        JOIN enrollments e 
            ON e.student_id = s.student_id

        JOIN course_offerings co 
            ON co.offering_id = e.offering_id

        JOIN submissions sub 
            ON sub.student_id = s.student_id

        JOIN assessments a 
            ON a.assessment_id = sub.assessment_id
            AND a.offering_id = co.offering_id

        JOIN assessment_clo ac 
            ON ac.assessment_id = a.assessment_id

        JOIN course_clo c 
            ON c.clo_id = ac.clo_id

        LEFT JOIN rubric_results rr 
            ON rr.submission_id = sub.submission_id

        WHERE co.offering_id = :offeringId

        GROUP BY c.clo_id, s.student_id
    ) t

    GROUP BY t.clo_id, range_label
    """, nativeQuery = true)
    List<Object[]> getDistributionByOffering(@Param("offeringId") String offeringId);

    // =========================================================
    // 5. ASSESSMENT MAPPING (OK)
    // =========================================================
    @Query(value = """
    SELECT 
        a.assessment_id,
        a.assessment_name,
        ac.clo_weight

    FROM assessments a

    JOIN assessment_clo ac 
        ON ac.assessment_id = a.assessment_id

    WHERE ac.clo_id = :cloId
      AND a.offering_id = :offeringId
    """, nativeQuery = true)
    List<Object[]> getAssessmentByCLO(
            @Param("offeringId") String offeringId,
            @Param("cloId") String cloId
    );

    // =========================================================
    // 6. SEARCH COURSE
    // =========================================================
    Page<Course> findByCourseNameContainingIgnoreCaseOrCourseIdContainingIgnoreCase(
            String courseName,
            String courseId,
            Pageable pageable
    );
}