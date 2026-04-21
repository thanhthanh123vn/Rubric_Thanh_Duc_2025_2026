package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment,String> {
    @Query(value = """
    SELECT 
        a.assessment_id,
        a.assessment_name,
        a.weight,
        a.end_time,

        s.submission_id,
        s.submitted_at,

        rr.calculated_score,
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
    List<Object[]> getAssignmentByCourseOffering(String offeringId, String studentId);


}
