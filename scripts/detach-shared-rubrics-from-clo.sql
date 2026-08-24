-- Chuan hoa 4 rubric dung chung hien co: rubric cap khoa khong so huu CLO.
-- CLO tiep tuc thuoc db_course.course_clo va duoc anh xa tai hoc phan/bai danh gia.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS db_course.assessment_criterion_clo (
    mapping_id VARCHAR(100) NOT NULL,
    assessment_id VARCHAR(50) NOT NULL,
    criteria_id VARCHAR(50) NOT NULL,
    clo_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (mapping_id),
    UNIQUE KEY uk_assessment_criterion_clo (assessment_id, criteria_id, clo_id),
    KEY idx_acc_clo (clo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

START TRANSACTION;

-- Bao toan mapping OBE hien tai truoc khi go CLO khoi rubric dung chung.
INSERT INTO db_course.assessment_criterion_clo
    (mapping_id, assessment_id, criteria_id, clo_id)
SELECT CONCAT('ACC-', a.assessment_id, '-', rc.criteria_id),
       a.assessment_id,
       rc.criteria_id,
       rc.clo_id
FROM db_course.assessments a
JOIN db_rubric_service.rubric_criteria rc ON rc.rubric_id = a.rubric_id
WHERE rc.rubric_id IN ('R1', 'R2', 'R3', 'R4')
  AND rc.clo_id IS NOT NULL
ON DUPLICATE KEY UPDATE clo_id = VALUES(clo_id);

UPDATE db_rubric_service.rubric_criteria
SET clo_id = NULL
WHERE rubric_id IN ('R1', 'R2', 'R3', 'R4');

UPDATE db_rubric_service.rubrics
SET rubric_type = 'FACULTY',
    visibility = 'FACULTY'
WHERE rubric_id IN ('R1', 'R2', 'R3', 'R4');

COMMIT;

SELECT r.rubric_id,
       r.rubric_name,
       r.rubric_type,
       r.visibility,
       COUNT(rc.criteria_id) AS criteria_count,
       SUM(CASE WHEN rc.clo_id IS NOT NULL THEN 1 ELSE 0 END) AS criteria_with_clo
FROM db_rubric_service.rubrics r
LEFT JOIN db_rubric_service.rubric_criteria rc ON rc.rubric_id = r.rubric_id
WHERE r.rubric_id IN ('R1', 'R2', 'R3', 'R4')
GROUP BY r.rubric_id, r.rubric_name, r.rubric_type, r.visibility
ORDER BY r.rubric_id;
