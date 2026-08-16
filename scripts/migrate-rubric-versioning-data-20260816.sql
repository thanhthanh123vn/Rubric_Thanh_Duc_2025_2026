-- Chuan hoa du lieu Rubric sau khi da chay migration schema versioning.
-- Du lieu hien tai:
--   R1/R2/R3: rubric chinh thuc dung chung trong khoa.
--   R4: bien the rieng cua giang vien chinh L002, clone tu R2 va dang cho Truong bo mon duyet.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_520_ci;
SET SQL_SAFE_UPDATES = 0;

-- Backup theo schema moi, chi giu ban chup dau tien.
CREATE TABLE IF NOT EXISTS backup_20260816_rubrics_versioning_data LIKE rubrics;
INSERT IGNORE INTO backup_20260816_rubrics_versioning_data
SELECT * FROM rubrics;

START TRANSACTION;

-- Gan khoa theo hoc phan cho tat ca rubric cu neu co the suy ra duoc.
UPDATE rubrics r
LEFT JOIN courses c ON c.course_id = r.course_id
LEFT JOIN department d ON d.department_id = c.department_id
SET r.faculty_id = d.faculty_id
WHERE r.faculty_id IS NULL
  AND d.faculty_id IS NOT NULL;

-- Rubric cu da duoc cong bo duoc xem la rubric chung v1 cua khoa.
UPDATE rubrics
SET rubric_type = 'FACULTY',
    visibility = 'FACULTY',
    root_rubric_id = rubric_id,
    parent_rubric_id = NULL,
    version_number = 1,
    submitted_at = NULL
WHERE rubric_id IN ('R1', 'R2', 'R3');

-- R4 la bien the rieng v1 cua giang vien chinh L002, bat nguon truc tiep tu rubric R2.
-- PENDING chi co thoi diem nop; reviewed_at phai de NULL den khi duoc xu ly.
UPDATE rubrics
SET faculty_id = COALESCE(faculty_id, 'F001'),
    lecturer_id = 'L002',
    rubric_type = 'LECTURER_VARIANT',
    visibility = 'PRIVATE',
    root_rubric_id = 'R2',
    parent_rubric_id = 'R2',
    version_number = 2,
    submitted_at = COALESCE(submitted_at, reviewed_at, created_at),
    reviewed_at = IF(status = 'PENDING', NULL, reviewed_at),
    reviewed_by = IF(status = 'PENDING', NULL, reviewed_by),
    feedback = IF(status = 'PENDING', NULL, feedback)
WHERE rubric_id = 'R4';

-- Khoi tao yeu cau duyet cho bien the R4; Truong bo mon la vai tro bat buoc.
INSERT INTO rubric_approval_requests (
    approval_request_id,
    rubric_id,
    revision_number,
    submitted_by,
    required_reviewer_role,
    status,
    requested_at,
    reviewed_by,
    reviewed_at,
    feedback
)
SELECT
    'RAR-R4-1',
    r.rubric_id,
    1,
    l.user_id,
    'HEAD_OF_DEPARTMENT',
    'PENDING',
    COALESCE(r.submitted_at, r.created_at),
    NULL,
    NULL,
    NULL
FROM rubrics r
JOIN lecturers l ON l.lecturer_id = r.lecturer_id
WHERE r.rubric_id = 'R4'
ON DUPLICATE KEY UPDATE
    submitted_by = VALUES(submitted_by),
    required_reviewer_role = VALUES(required_reviewer_role),
    status = IF(
        rubric_approval_requests.status IN ('APPROVED', 'REJECTED', 'CANCELLED'),
        rubric_approval_requests.status,
        VALUES(status)
    ),
    requested_at = IF(
        rubric_approval_requests.status IN ('APPROVED', 'REJECTED', 'CANCELLED'),
        rubric_approval_requests.requested_at,
        VALUES(requested_at)
    );

COMMIT;

-- Kiem tra ket qua: R4 phai PRIVATE/PENDING va co dung mot yeu cau duyet HEAD_OF_DEPARTMENT.
SELECT
    rubric_id,
    faculty_id,
    lecturer_id,
    rubric_type,
    visibility,
    root_rubric_id,
    parent_rubric_id,
    version_number,
    status,
    submitted_at,
    reviewed_at
FROM rubrics
ORDER BY rubric_id;

SELECT
    approval_request_id,
    rubric_id,
    revision_number,
    submitted_by,
    required_reviewer_role,
    status,
    requested_at,
    reviewed_by,
    reviewed_at
FROM rubric_approval_requests
ORDER BY requested_at, approval_request_id;

-- Cac truy van sau phai tra ve 0 dong.
SELECT rubric_id AS invalid_private_variant
FROM rubrics
WHERE rubric_type = 'LECTURER_VARIANT'
  AND (
      visibility <> 'PRIVATE'
      OR lecturer_id IS NULL
      OR root_rubric_id IS NULL
      OR parent_rubric_id IS NULL
  );

SELECT r.rubric_id AS pending_without_approval_request
FROM rubrics r
LEFT JOIN rubric_approval_requests ar
       ON ar.rubric_id = r.rubric_id
      AND ar.status = 'PENDING'
WHERE r.status = 'PENDING'
  AND ar.approval_request_id IS NULL;

SET SQL_SAFE_UPDATES = 1;
