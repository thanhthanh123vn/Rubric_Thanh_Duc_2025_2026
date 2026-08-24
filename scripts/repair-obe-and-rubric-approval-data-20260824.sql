-- Repair real relational data used by OBE analytics and rubric approval queues.
-- MySQL 8.x. Safe to run repeatedly.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
START TRANSACTION;

-- Keep one pre-repair snapshot for audit/rollback.
CREATE TABLE IF NOT EXISTS db_course.assessment_criterion_clo_backup_20260824
AS SELECT * FROM db_course.assessment_criterion_clo;

CREATE TABLE IF NOT EXISTS db_rubric_service.rubrics_backup_20260824
AS SELECT * FROM db_rubric_service.rubrics;

CREATE TABLE IF NOT EXISTS db_rubric_service.rubric_approval_requests_backup_20260824
AS SELECT * FROM db_rubric_service.rubric_approval_requests;

-- Restore assessment -> rubric criterion -> CLO mappings from the rubric that is
-- genuinely attached to the assessment, submission, or final grade. A criterion
-- is inserted only when its CLO is also declared in assessment_clo.
INSERT INTO db_course.assessment_criterion_clo
    (mapping_id, assessment_id, criteria_id, clo_id)
SELECT
    CONCAT('ACC-', SUBSTRING(SHA2(CONCAT_WS('|', ar.assessment_id, rc.criteria_id, rc.clo_id), 256), 1, 40)),
    ar.assessment_id,
    rc.criteria_id,
    rc.clo_id
FROM (
    SELECT assessment_id, rubric_id
    FROM db_course.assessments
    WHERE rubric_id IS NOT NULL AND rubric_id <> ''

    UNION

    SELECT assessment_id, rubric_id
    FROM db_course.submissions
    WHERE rubric_id IS NOT NULL AND rubric_id <> ''

    UNION

    SELECT assessment_id, rubric_id
    FROM db_grading.Grades
    WHERE rubric_id IS NOT NULL AND rubric_id <> ''
) ar
JOIN db_course.assessment_clo ac
    ON ac.assessment_id = ar.assessment_id
JOIN db_rubric_service.rubric_criteria rc
    ON rc.rubric_id = ar.rubric_id
   AND rc.clo_id = ac.clo_id
WHERE rc.clo_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM db_course.assessment_criterion_clo existing_mapping
      WHERE existing_mapping.assessment_id = ar.assessment_id
        AND existing_mapping.criteria_id = rc.criteria_id
        AND existing_mapping.clo_id = rc.clo_id
  );

-- The existing shared rubrics are all APPROVED, so Dean correctly had no pending
-- item. Create a genuine shared version proposal by cloning the current C003
-- rubric and all of its criteria/levels. It remains invisible to normal users
-- until Dean approves it.
INSERT INTO db_rubric_service.rubrics (
    rubric_id, lecturer_id, rubric_name, description, created_at, updated_at,
    course_id, faculty_id, rubric_type, visibility, root_rubric_id,
    parent_rubric_id, version_number, created_by, feedback, submitted_at,
    reviewed_at, reviewed_by, status
)
SELECT
    'R-C003-V2-PENDING',
    source_rubric.lecturer_id,
    CONCAT(source_rubric.rubric_name, ' - Đề xuất cập nhật v2'),
    source_rubric.description,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    source_rubric.course_id,
    source_rubric.faculty_id,
    'FACULTY',
    'FACULTY',
    COALESCE(source_rubric.root_rubric_id, source_rubric.rubric_id),
    source_rubric.rubric_id,
    2,
    source_rubric.created_by,
    NULL,
    CURRENT_TIMESTAMP,
    NULL,
    NULL,
    'PENDING'
FROM db_rubric_service.rubrics source_rubric
WHERE source_rubric.rubric_id = 'R-C003'
  AND source_rubric.status = 'APPROVED'
  AND NOT EXISTS (
      SELECT 1 FROM db_rubric_service.rubrics
      WHERE rubric_id = 'R-C003-V2-PENDING'
  );

INSERT INTO db_rubric_service.rubric_criteria
    (criteria_id, rubric_id, clo_id, criteria_name, description, weight)
SELECT
    REPLACE(source_criteria.criteria_id, 'RC-C003', 'RC-C003-V2'),
    'R-C003-V2-PENDING',
    source_criteria.clo_id,
    source_criteria.criteria_name,
    source_criteria.description,
    source_criteria.weight
FROM db_rubric_service.rubric_criteria source_criteria
WHERE source_criteria.rubric_id = 'R-C003'
  AND EXISTS (
      SELECT 1 FROM db_rubric_service.rubrics
      WHERE rubric_id = 'R-C003-V2-PENDING'
  )
  AND NOT EXISTS (
      SELECT 1 FROM db_rubric_service.rubric_criteria existing_criteria
      WHERE existing_criteria.criteria_id =
            REPLACE(source_criteria.criteria_id, 'RC-C003', 'RC-C003-V2')
  );

INSERT INTO db_rubric_service.rubric_levels
    (level_id, criteria_id, level_name, description, score)
SELECT
    REPLACE(source_level.level_id, 'RC-C003', 'RC-C003-V2'),
    REPLACE(source_level.criteria_id, 'RC-C003', 'RC-C003-V2'),
    source_level.level_name,
    source_level.description,
    source_level.score
FROM db_rubric_service.rubric_levels source_level
JOIN db_rubric_service.rubric_criteria source_criteria
    ON source_criteria.criteria_id = source_level.criteria_id
   AND source_criteria.rubric_id = 'R-C003'
WHERE NOT EXISTS (
    SELECT 1 FROM db_rubric_service.rubric_levels existing_level
    WHERE existing_level.level_id =
          REPLACE(source_level.level_id, 'RC-C003', 'RC-C003-V2')
);

INSERT INTO db_rubric_service.rubric_approval_requests (
    approval_request_id, rubric_id, revision_number, submitted_by,
    required_reviewer_role, status, requested_at, reviewed_by,
    reviewed_at, feedback
)
SELECT
    'RAR-R-C003-V2-1',
    pending_rubric.rubric_id,
    1,
    pending_rubric.created_by,
    'DEAN',
    'PENDING',
    pending_rubric.submitted_at,
    NULL,
    NULL,
    NULL
FROM db_rubric_service.rubrics pending_rubric
WHERE pending_rubric.rubric_id = 'R-C003-V2-PENDING'
  AND pending_rubric.status = 'PENDING'
  AND NOT EXISTS (
      SELECT 1 FROM db_rubric_service.rubric_approval_requests
      WHERE rubric_id = pending_rubric.rubric_id
        AND revision_number = 1
  );

-- Backfill an approval request for any other real pending rubric that may have
-- been created before approval history was introduced.
INSERT INTO db_rubric_service.rubric_approval_requests (
    approval_request_id, rubric_id, revision_number, submitted_by,
    required_reviewer_role, status, requested_at, reviewed_by,
    reviewed_at, feedback
)
SELECT
    CONCAT('RAR-BF-', SUBSTRING(SHA2(r.rubric_id, 256), 1, 40)),
    r.rubric_id,
    1,
    COALESCE(r.created_by, lecturer.user_id),
    CASE WHEN r.rubric_type = 'LECTURER_VARIANT'
         THEN 'HEAD_OF_DEPARTMENT' ELSE 'DEAN' END,
    'PENDING',
    COALESCE(r.submitted_at, r.created_at, CURRENT_TIMESTAMP),
    NULL,
    NULL,
    NULL
FROM db_rubric_service.rubrics r
LEFT JOIN db_user.lecturers lecturer
    ON lecturer.lecturer_id = r.lecturer_id
WHERE r.status = 'PENDING'
  AND COALESCE(r.created_by, lecturer.user_id) IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM db_rubric_service.rubric_approval_requests request
      WHERE request.rubric_id = r.rubric_id
  );

-- Correct the mislabeled department-head account. Authorization remains based
-- on role, while the UI now displays the proper leadership title.
UPDATE db_user.users
SET full_name = 'Trưởng bộ môn CNTT'
WHERE user_id = 'U005'
  AND role = 'HEAD_OF_DEPARTMENT'
  AND full_name <> 'Trưởng bộ môn CNTT';

UPDATE db_user.lecturers
SET full_name = 'Trưởng bộ môn CNTT'
WHERE user_id = 'U005'
  AND full_name <> 'Trưởng bộ môn CNTT';

COMMIT;

-- Verification: expected after this repair
--   assessment_criterion_clo: populated from actual assessment/rubric/CLO links
--   Dean pending shared rubrics: at least R-C003-V2-PENDING
--   HOD pending variants: the existing lecturer-specific version requests
SELECT COUNT(*) AS assessment_criterion_clo_count
FROM db_course.assessment_criterion_clo;

SELECT rubric_type, status, COUNT(*) AS rubric_count
FROM db_rubric_service.rubrics
GROUP BY rubric_type, status
ORDER BY rubric_type, status;

SELECT required_reviewer_role, status, COUNT(*) AS request_count
FROM db_rubric_service.rubric_approval_requests
GROUP BY required_reviewer_role, status
ORDER BY required_reviewer_role, status;
