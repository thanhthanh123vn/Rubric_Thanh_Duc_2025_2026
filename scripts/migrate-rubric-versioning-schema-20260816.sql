-- Bo sung cau truc version/variant va lich su phe duyet Rubric.
-- Chay script nay TRUOC migrate-rubric-versioning-data-20260816.sql.
-- Tuong thich MariaDB 10.4; co the chay lai an toan.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_520_ci;

-- Luu nguyen trang bang rubrics truoc khi doi schema (chi tao mot lan).
CREATE TABLE IF NOT EXISTS backup_20260816_rubrics_before_versioning LIKE rubrics;
INSERT IGNORE INTO backup_20260816_rubrics_before_versioning
    (rubric_id, lecturer_id, rubric_name, description, created_at, course_id,
     created_by, feedback, reviewed_at, reviewed_by, status)
SELECT rubric_id, lecturer_id, rubric_name, description, created_at, course_id,
       created_by, feedback, reviewed_at, reviewed_by, status
FROM rubrics;

ALTER TABLE rubrics
    ADD COLUMN IF NOT EXISTS faculty_id VARCHAR(50) NULL AFTER course_id,
    ADD COLUMN IF NOT EXISTS rubric_type
        ENUM('FACULTY', 'LECTURER_VARIANT') NOT NULL DEFAULT 'FACULTY'
        AFTER faculty_id,
    ADD COLUMN IF NOT EXISTS visibility
        ENUM('FACULTY', 'PRIVATE') NOT NULL DEFAULT 'FACULTY'
        AFTER rubric_type,
    ADD COLUMN IF NOT EXISTS root_rubric_id VARCHAR(50) NULL AFTER visibility,
    ADD COLUMN IF NOT EXISTS parent_rubric_id VARCHAR(50) NULL AFTER root_rubric_id,
    ADD COLUMN IF NOT EXISTS version_number INT UNSIGNED NOT NULL DEFAULT 1
        AFTER parent_rubric_id,
    ADD COLUMN IF NOT EXISTS submitted_at DATETIME(6) NULL AFTER feedback,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

CREATE INDEX IF NOT EXISTS idx_rubrics_faculty_visibility
    ON rubrics (faculty_id, visibility, status);
CREATE INDEX IF NOT EXISTS idx_rubrics_owner_visibility
    ON rubrics (lecturer_id, visibility, status);
CREATE INDEX IF NOT EXISTS idx_rubrics_root_version
    ON rubrics (root_rubric_id, rubric_type, lecturer_id, version_number);
CREATE INDEX IF NOT EXISTS idx_rubrics_parent
    ON rubrics (parent_rubric_id);

-- Chi them constraint neu database chua co constraint cung ten.
SET @ddl = IF(
    EXISTS (
        SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_SCHEMA = DATABASE()
          AND TABLE_NAME = 'rubrics'
          AND CONSTRAINT_NAME = 'fk_rubrics_faculty'
    ),
    'SELECT 1',
    'ALTER TABLE rubrics ADD CONSTRAINT fk_rubrics_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id)'
);
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ddl = IF(
    EXISTS (
        SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_SCHEMA = DATABASE()
          AND TABLE_NAME = 'rubrics'
          AND CONSTRAINT_NAME = 'fk_rubrics_root'
    ),
    'SELECT 1',
    'ALTER TABLE rubrics ADD CONSTRAINT fk_rubrics_root FOREIGN KEY (root_rubric_id) REFERENCES rubrics(rubric_id)'
);
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ddl = IF(
    EXISTS (
        SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_SCHEMA = DATABASE()
          AND TABLE_NAME = 'rubrics'
          AND CONSTRAINT_NAME = 'fk_rubrics_parent'
    ),
    'SELECT 1',
    'ALTER TABLE rubrics ADD CONSTRAINT fk_rubrics_parent FOREIGN KEY (parent_rubric_id) REFERENCES rubrics(rubric_id)'
);
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Moi lan gui duyet la mot dong rieng de khong mat lich su khi nop lai.
CREATE TABLE IF NOT EXISTS rubric_approval_requests (
    approval_request_id VARCHAR(64) NOT NULL,
    rubric_id VARCHAR(50) NOT NULL,
    revision_number INT UNSIGNED NOT NULL DEFAULT 1,
    submitted_by VARCHAR(50) NOT NULL,
    required_reviewer_role ENUM('DEAN') NOT NULL DEFAULT 'DEAN',
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')
        NOT NULL DEFAULT 'PENDING',
    requested_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    reviewed_by VARCHAR(50) NULL,
    reviewed_at DATETIME(6) NULL,
    feedback TEXT NULL,
    PRIMARY KEY (approval_request_id),
    UNIQUE KEY uk_rubric_approval_revision (rubric_id, revision_number),
    KEY idx_rubric_approval_queue (status, requested_at),
    KEY idx_rubric_approval_submitter (submitted_by, status),
    CONSTRAINT fk_rubric_approval_rubric
        FOREIGN KEY (rubric_id) REFERENCES rubrics(rubric_id),
    CONSTRAINT fk_rubric_approval_submitter
        FOREIGN KEY (submitted_by) REFERENCES users(user_id),
    CONSTRAINT fk_rubric_approval_reviewer
        FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_520_ci;

SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'rubrics'
  AND COLUMN_NAME IN (
      'faculty_id', 'rubric_type', 'visibility', 'root_rubric_id',
      'parent_rubric_id', 'version_number', 'submitted_at', 'updated_at'
  )
ORDER BY ORDINAL_POSITION;

SHOW CREATE TABLE rubric_approval_requests;
