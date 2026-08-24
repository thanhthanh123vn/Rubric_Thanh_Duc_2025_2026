ALTER TABLE db_course.course_clo
    ADD COLUMN IF NOT EXISTS approval_status VARCHAR(30) NULL DEFAULT 'DRAFT' AFTER bloom_level,
    ADD COLUMN IF NOT EXISTS submitted_by VARCHAR(50) NULL AFTER approval_status,
    ADD COLUMN IF NOT EXISTS submitted_by_name VARCHAR(255) NULL AFTER submitted_by,
    ADD COLUMN IF NOT EXISTS submitted_at DATETIME NULL AFTER submitted_by_name,
    ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(50) NULL AFTER submitted_at,
    ADD COLUMN IF NOT EXISTS reviewed_by_name VARCHAR(255) NULL AFTER reviewed_by,
    ADD COLUMN IF NOT EXISTS reviewed_at DATETIME NULL AFTER reviewed_by_name,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL AFTER reviewed_at;

UPDATE db_course.course_clo clo
JOIN db_course.clo_plo_submissions legacy
  ON legacy.course_id = clo.course_id
 AND legacy.submission_type = 'CLO'
SET clo.approval_status = legacy.status,
    clo.submitted_by = legacy.submitted_by,
    clo.submitted_by_name = legacy.submitted_by_name,
    clo.submitted_at = legacy.submitted_at,
    clo.reviewed_by = legacy.reviewed_by,
    clo.reviewed_by_name = legacy.reviewed_by_name,
    clo.reviewed_at = legacy.reviewed_at,
    clo.rejection_reason = legacy.rejection_reason;

UPDATE db_course.course_clo
SET approval_status = 'DRAFT'
WHERE approval_status IS NULL OR approval_status = '';

ALTER TABLE db_course.course_clo
    MODIFY COLUMN approval_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT';

DELETE FROM db_course.clo_plo_submissions
WHERE submission_type = 'CLO';

SET @add_clo_approval_index = IF(
    EXISTS(
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = 'db_course'
          AND table_name = 'course_clo'
          AND index_name = 'idx_course_clo_approval'
    ),
    'SELECT 1',
    'ALTER TABLE db_course.course_clo ADD INDEX idx_course_clo_approval (approval_status, course_id, submitted_at)'
);
PREPARE add_clo_approval_index_stmt FROM @add_clo_approval_index;
EXECUTE add_clo_approval_index_stmt;
DEALLOCATE PREPARE add_clo_approval_index_stmt;
