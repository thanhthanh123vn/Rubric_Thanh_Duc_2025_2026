package hcmuaf.edu.vn.fit.course_service.repository.jpa;

import hcmuaf.edu.vn.fit.course_service.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment,String> {
    @Query(value = """
    SELECT 
        a.assessment_id,
        a.assessment_name,
        a.assessment_type,
        a.weight,
        a.end_time,

        s.submission_id,
        s.submitted_at,

        sum(rr.calculated_score) as total_score,
        rr.lecturer_comment,
            
        CONCAT('[', GROUP_CONCAT(DISTINCT CONCAT('"', c.clo_code, '"')), ']') AS clos
                                    
    FROM assessments a

    LEFT JOIN submissions s 
        ON s.assessment_id = a.assessment_id
        AND s.student_id = :studentId

    LEFT JOIN rubric_results rr 
        ON rr.submission_id = s.submission_id

    LEFT JOIN assessment_clo ac 
        ON ac.assessment_id = a.assessment_id

    LEFT JOIN course_clo c 
        ON c.clo_id = ac.clo_id

    WHERE a.offering_id = :offeringId
    group by a.assessment_id
    """, nativeQuery = true)
    List<Object[]> getAssignmentByCourseOffering(@Param("offeringId") String offeringId,@Param("studentId") String studentId);

    @Query(value = """
    SELECT 
        a.assessment_id,
        a.assessment_name,
        a.description,
        a.assessment_type,
        a.weight,
        a.end_time,

        s.submission_id,
        s.submitted_at,

        sum(rr.calculated_score) as total_score,
        rr.lecturer_comment,
            CONCAT(
                   '[',
                   GROUP_CONCAT(
                       DISTINCT CONCAT(
                           '{"code":"', c.clo_code,
                           '","description":"', c.description, '"}'
                       )
                   ),
                   ']'
               ) AS clos                                    
    FROM assessments a

    LEFT JOIN submissions s 
        ON s.assessment_id = a.assessment_id
        AND s.student_id = :studentId

    LEFT JOIN rubric_results rr 
        ON rr.submission_id = s.submission_id

    LEFT JOIN assessment_clo ac 
        ON ac.assessment_id = a.assessment_id

    LEFT JOIN course_clo c 
        ON c.clo_id = ac.clo_id
    WHERE a.assessment_id = :assessmentId
    GROUP BY
    a.assessment_id,
    a.assessment_name,
    a.description,
    a.assessment_type,
    a.weight,
    a.end_time,
    s.submission_id,
    s.submitted_at; 
    """, nativeQuery = true)
    List<Object[]> getAssignmentDetail(String assessmentId,String studentId);

    @Query(value = """
    SELECT
        rr.criteria_id,
        rc.criteria_name,
        rr.level_id,
        rl.level_name,
        rr.calculated_score,
        max_level.max_score
    FROM submissions s
    JOIN rubric_results rr
        ON rr.submission_id = s.submission_id
    LEFT JOIN rubric_criteria rc
        ON rc.criteria_id = rr.criteria_id
    LEFT JOIN rubric_levels rl
        ON rl.level_id = rr.level_id
    LEFT JOIN (
        SELECT criteria_id, MAX(score) AS max_score
        FROM rubric_levels
        GROUP BY criteria_id
    ) max_level
        ON max_level.criteria_id = rr.criteria_id
    WHERE s.assessment_id = :assessmentId
      AND s.student_id = :studentId
    ORDER BY rr.criteria_id
    """, nativeQuery = true)
    List<Object[]> getRubricCriterionDetails(@Param("assessmentId") String assessmentId, @Param("studentId") String studentId);

    List<Assessment> findByCourseOffering_OfferingIdOrderByStartTimeDesc(String offeringId);
}
