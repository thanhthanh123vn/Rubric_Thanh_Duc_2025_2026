-- Synchronize rubric state with approval history for both leadership screens.
-- MySQL/MariaDB. Safe to run repeatedly.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
START TRANSACTION;

CREATE TABLE IF NOT EXISTS db_rubric_service.rubric_approval_requests_sync_backup_20260824
AS SELECT * FROM db_rubric_service.rubric_approval_requests;

-- Backfill history for legacy rubrics that already have a workflow state but
-- were created before rubric_approval_requests was introduced.
INSERT INTO db_rubric_service.rubric_approval_requests (
    approval_request_id, rubric_id, revision_number, submitted_by,
    required_reviewer_role, status, requested_at, reviewed_by,
    reviewed_at, feedback
)
SELECT
    CONCAT('RAR-SYNC-', SUBSTRING(SHA2(r.rubric_id, 256), 1, 36)),
    r.rubric_id,
    1,
    COALESCE(r.created_by, submitter.user_id),
    CASE WHEN r.rubric_type = 'LECTURER_VARIANT'
         THEN 'HEAD_OF_DEPARTMENT' ELSE 'DEAN' END,
    r.status,
    COALESCE(r.submitted_at, r.created_at, CURRENT_TIMESTAMP),
    CASE
        WHEN r.status NOT IN ('APPROVED', 'REJECTED') THEN NULL
        WHEN r.reviewed_by IS NOT NULL THEN r.reviewed_by
        WHEN r.rubric_type = 'LECTURER_VARIANT' THEN 'U005'
        ELSE 'U004'
    END,
    CASE WHEN r.status IN ('APPROVED', 'REJECTED')
         THEN COALESCE(r.reviewed_at, r.updated_at, r.created_at)
         ELSE NULL END,
    r.feedback
FROM db_rubric_service.rubrics r
LEFT JOIN db_user.lecturers submitter
    ON submitter.lecturer_id = r.lecturer_id
WHERE r.status IN ('PENDING', 'APPROVED', 'REJECTED')
  AND COALESCE(r.created_by, submitter.user_id) IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM db_rubric_service.rubric_approval_requests request
      WHERE request.rubric_id = r.rubric_id
  );

-- The latest request and the rubric row represent the same current workflow
-- state. Keep older revisions unchanged as immutable history.
UPDATE db_rubric_service.rubric_approval_requests request
JOIN (
    SELECT rubric_id, MAX(revision_number) AS latest_revision
    FROM db_rubric_service.rubric_approval_requests
    GROUP BY rubric_id
) latest
    ON latest.rubric_id = request.rubric_id
   AND latest.latest_revision = request.revision_number
JOIN db_rubric_service.rubrics r
    ON r.rubric_id = request.rubric_id
SET request.status = r.status,
    request.required_reviewer_role =
        CASE WHEN r.rubric_type = 'LECTURER_VARIANT'
             THEN 'HEAD_OF_DEPARTMENT' ELSE 'DEAN' END,
    request.reviewed_by =
        CASE WHEN r.status IN ('APPROVED', 'REJECTED')
             THEN COALESCE(r.reviewed_by, request.reviewed_by,
                  CASE WHEN r.rubric_type = 'LECTURER_VARIANT' THEN 'U005' ELSE 'U004' END)
             ELSE NULL END,
    request.reviewed_at =
        CASE WHEN r.status IN ('APPROVED', 'REJECTED')
             THEN COALESCE(r.reviewed_at, request.reviewed_at, r.updated_at, r.created_at)
             ELSE NULL END,
    request.feedback = r.feedback;

COMMIT;

SELECT r.rubric_type, r.status, COUNT(*) AS rubric_count
FROM db_rubric_service.rubrics r
GROUP BY r.rubric_type, r.status
ORDER BY r.rubric_type, r.status;

SELECT request.required_reviewer_role, request.status, COUNT(*) AS request_count
FROM db_rubric_service.rubric_approval_requests request
GROUP BY request.required_reviewer_role, request.status
ORDER BY request.required_reviewer_role, request.status;

SELECT COUNT(*) AS missing_approval_history
FROM db_rubric_service.rubrics r
WHERE r.status IN ('PENDING', 'APPROVED', 'REJECTED')
  AND NOT EXISTS (
      SELECT 1 FROM db_rubric_service.rubric_approval_requests request
      WHERE request.rubric_id = r.rubric_id
  );
