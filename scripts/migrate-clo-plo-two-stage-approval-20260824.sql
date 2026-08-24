ALTER TABLE db_course.clo_plo_submissions
    ADD COLUMN IF NOT EXISTS submission_type VARCHAR(30) NULL AFTER course_id;

UPDATE db_course.clo_plo_submissions
SET submission_type = 'CLO'
WHERE submission_type IS NULL OR submission_type = '';

SET @add_course_index = IF(
    EXISTS(
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = 'db_course'
          AND table_name = 'clo_plo_submissions'
          AND index_name = 'idx_clo_plo_submission_course'
    ),
    'SELECT 1',
    'ALTER TABLE db_course.clo_plo_submissions ADD INDEX idx_clo_plo_submission_course (course_id)'
);
PREPARE add_course_index_stmt FROM @add_course_index;
EXECUTE add_course_index_stmt;
DEALLOCATE PREPARE add_course_index_stmt;

SET @drop_old_unique = IF(
    EXISTS(
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = 'db_course'
          AND table_name = 'clo_plo_submissions'
          AND index_name = 'uk_clo_plo_submission_course'
    ),
    'ALTER TABLE db_course.clo_plo_submissions DROP INDEX uk_clo_plo_submission_course',
    'SELECT 1'
);
PREPARE drop_old_unique_stmt FROM @drop_old_unique;
EXECUTE drop_old_unique_stmt;
DEALLOCATE PREPARE drop_old_unique_stmt;

ALTER TABLE db_course.clo_plo_submissions
    MODIFY COLUMN submission_type VARCHAR(30) NOT NULL;

SET @add_new_unique = IF(
    EXISTS(
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = 'db_course'
          AND table_name = 'clo_plo_submissions'
          AND index_name = 'uk_clo_plo_submission_course_type'
    ),
    'SELECT 1',
    'ALTER TABLE db_course.clo_plo_submissions ADD UNIQUE KEY uk_clo_plo_submission_course_type (course_id, submission_type)'
);
PREPARE add_new_unique_stmt FROM @add_new_unique;
EXECUTE add_new_unique_stmt;
DEALLOCATE PREPARE add_new_unique_stmt;
