SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE db_course.courses
    ADD COLUMN IF NOT EXISTS program_id VARCHAR(50) NULL AFTER department_id;

UPDATE db_course.courses
SET program_id = 'PROGRAM-CNTT'
WHERE program_id IS NULL OR program_id = '';

CREATE TABLE IF NOT EXISTS db_course.clo_plo_submissions (
    submission_id VARCHAR(64) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    submission_type VARCHAR(30) NOT NULL DEFAULT 'CLO',
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    revision_number INT NOT NULL DEFAULT 0,
    submitted_by VARCHAR(50) NULL,
    submitted_by_name VARCHAR(255) NULL,
    submitted_at DATETIME NULL,
    reviewed_by VARCHAR(50) NULL,
    reviewed_by_name VARCHAR(255) NULL,
    reviewed_at DATETIME NULL,
    rejection_reason TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (submission_id),
    UNIQUE KEY uk_clo_plo_submission_course_type (course_id, submission_type),
    CONSTRAINT fk_clo_plo_submission_course
        FOREIGN KEY (course_id) REFERENCES db_course.courses(course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
