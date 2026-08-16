package hcmuaf.edu.vn.fit.rubric_service.repository;

import hcmuaf.edu.vn.fit.rubric_service.entity.Rubric;
import hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricStatus;
import hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RubricRepository extends JpaRepository<Rubric, String> {

    @EntityGraph(attributePaths = {
            "criteria",
            "criteria.levels"
    })
    List<Rubric> findAllByOrderByRubricNameAsc();

    @EntityGraph(attributePaths = {
            "criteria",
            "criteria.levels"
    })
    Optional<Rubric> findWithCriteriaAndLevelsByRubricId(String rubricId);

    List<Rubric> findByStatus(RubricStatus status);

    List<Rubric> findByStatusAndRubricType(RubricStatus status, RubricType rubricType);

    @EntityGraph(attributePaths = {"criteria", "criteria.levels"})
    @Query("""
            SELECT DISTINCT r FROM Rubric r
            WHERE (r.status = hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricStatus.APPROVED
                   AND r.visibility = hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricVisibility.FACULTY)
               OR (r.visibility = hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricVisibility.PRIVATE
                   AND r.status = hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricStatus.APPROVED
                   AND r.lecturerId = :lecturerId)
            ORDER BY r.rubricName ASC
            """)
    List<Rubric> findVisibleToLecturer(@Param("lecturerId") String lecturerId);

    @EntityGraph(attributePaths = {"criteria", "criteria.levels"})
    @Query("""
            SELECT DISTINCT r FROM Rubric r
            WHERE (r.status = hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricStatus.APPROVED
                   AND r.visibility = hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricVisibility.FACULTY)
               OR (r.visibility = hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricVisibility.PRIVATE
                   AND r.lecturerId = :lecturerId)
            ORDER BY r.rubricName ASC
            """)
    List<Rubric> findManageableByLecturer(@Param("lecturerId") String lecturerId);

    @EntityGraph(attributePaths = {"criteria", "criteria.levels"})
    @Query("""
            SELECT DISTINCT r FROM Rubric r
            WHERE r.status = hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricStatus.APPROVED
              AND r.visibility = hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricVisibility.FACULTY
            ORDER BY r.rubricName ASC
            """)
    List<Rubric> findPublishedFacultyRubrics();

    @Query("SELECT COALESCE(MAX(r.versionNumber), 0) FROM Rubric r WHERE r.rootRubricId = :rootRubricId")
    Integer findMaxVersionNumber(@Param("rootRubricId") String rootRubricId);

    @EntityGraph(attributePaths = {"criteria", "criteria.levels"})
    @Query("""
            SELECT DISTINCT r FROM Rubric r
            WHERE r.rootRubricId = :rootRubricId
              AND (r.rubricType = hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricType.FACULTY
                   OR r.lecturerId = :lecturerId)
            ORDER BY r.versionNumber DESC, r.createdAt DESC
            """)
    List<Rubric> findVersionHistory(
            @Param("rootRubricId") String rootRubricId,
            @Param("lecturerId") String lecturerId
    );
    List<Rubric> findTop20ByOrderByCreatedAtDesc();
    @Query("SELECT r FROM Rubric r WHERE r.status = :status AND r.courseId IN :courseIds")
    List<Rubric> findByStatusAndCourseIdsIn(@Param("status") RubricStatus status, @Param("courseIds") List<String> courseIds);

    @Query("SELECT r FROM Rubric r WHERE r.status = :status AND r.rubricType = :rubricType AND r.courseId IN :courseIds")
    List<Rubric> findByStatusAndRubricTypeAndCourseIdsIn(
            @Param("status") RubricStatus status,
            @Param("rubricType") RubricType rubricType,
            @Param("courseIds") List<String> courseIds
    );

    @Query("""
            SELECT r FROM Rubric r
            WHERE r.status = :status
              AND r.rubricType = hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricType.FACULTY
              AND r.courseId IN :courseIds
            """)
    List<Rubric> findFacultyByStatusAndCourseIdsIn(
            @Param("status") RubricStatus status,
            @Param("courseIds") List<String> courseIds
    );
}
