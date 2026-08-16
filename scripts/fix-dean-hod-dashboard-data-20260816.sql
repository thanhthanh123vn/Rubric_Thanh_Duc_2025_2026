-- Sua du lieu cho man Tong quan Truong khoa/Truong bo mon va Phe duyet Rubric.
-- Nguon doi chieu: dump db_rubric ngay 2026-08-16 (ban moi).
-- Script chi cap nhat du lieu; khong sua phan quyen Spring Security trong source code.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_520_ci;
SET SQL_SAFE_UPDATES = 0;

SET @faculty_id = 'F001';
SET @department_id = 'D001';
SET @department_name = 'Khoa CNTT';
SET @dean_user_id = 'U004';
SET @dean_lecturer_id = 'L004';
SET @hod_user_id = 'U005';
SET @hod_lecturer_id = 'L005';

-- =========================================================
-- 0. KIEM TRA DU LIEU TRUOC KHI SUA
-- =========================================================
SELECT user_id, username, email, role, full_name, is_locked
FROM users
WHERE user_id IN (@dean_user_id, @hod_user_id);

SELECT lecturer_id, user_id, full_name, department_id
FROM lecturers
WHERE user_id IN (@dean_user_id, @hod_user_id);

SELECT faculty_id, faculty_name, dean_name, dean_user_id
FROM faculty
WHERE faculty_id = @faculty_id;

SELECT id, department_id, lecturer_id, start_date, end_date, status
FROM head_of_department
WHERE department_id = @department_id;

-- =========================================================
-- 1. BACKUP MOT LAN
-- =========================================================
CREATE TABLE IF NOT EXISTS backup_20260816_dean_hod_users LIKE users;
INSERT IGNORE INTO backup_20260816_dean_hod_users
SELECT * FROM users WHERE user_id IN (@dean_user_id, @hod_user_id);

CREATE TABLE IF NOT EXISTS backup_20260816_dean_hod_lecturers LIKE lecturers;
INSERT IGNORE INTO backup_20260816_dean_hod_lecturers
SELECT * FROM lecturers WHERE user_id IN (@dean_user_id, @hod_user_id);

CREATE TABLE IF NOT EXISTS backup_20260816_faculty_assignment LIKE faculty;
INSERT IGNORE INTO backup_20260816_faculty_assignment
SELECT * FROM faculty WHERE faculty_id = @faculty_id;

CREATE TABLE IF NOT EXISTS backup_20260816_hod_assignment LIKE head_of_department;
INSERT IGNORE INTO backup_20260816_hod_assignment
SELECT * FROM head_of_department WHERE department_id = @department_id;

CREATE TABLE IF NOT EXISTS backup_20260816_course_department LIKE courses;
INSERT IGNORE INTO backup_20260816_course_department
SELECT * FROM courses WHERE course_id = 'C001';

START TRANSACTION;

-- =========================================================
-- 2. CHUAN HOA TAI KHOAN TRUONG KHOA VA TRUONG BO MON
-- Dump co U003, U004, U005 cung username 'tranthib', lam dang nhap theo
-- username co the tra ve nhieu ban ghi. Giu U003 va doi U004/U005 thanh duy nhat.
-- =========================================================
UPDATE users
SET auth_provider = COALESCE(auth_provider, 'LOCAL'),
    username = 'truongkhoa.cntt',
    role = 'DEAN',
    full_name = 'Trưởng khoa Công nghệ thông tin',
    is_locked = b'0'
WHERE user_id = @dean_user_id;

UPDATE users
SET auth_provider = COALESCE(auth_provider, 'LOCAL'),
    username = 'truongbomon.cntt',
    role = 'HEAD_OF_DEPARTMENT',
    full_name = 'Trưởng bộ môn Khoa CNTT',
    is_locked = b'0'
WHERE user_id = @hod_user_id;

-- =========================================================
-- 3. TAO HO SO LECTURER BAT BUOC CHO HAI TAI KHOAN
-- DeanService va RubricService deu tim lecturer bang user_id.
-- =========================================================
INSERT INTO lecturers
    (lecturer_id, user_id, full_name, department, academic_title,
     department_id, address, cccd, date_of_birth, gender, phone_number)
VALUES
    (@dean_lecturer_id, @dean_user_id, 'Trưởng khoa Công nghệ thông tin',
     @department_name, 'PGS.TS', @department_id, NULL, NULL, NULL, NULL, NULL),
    (@hod_lecturer_id, @hod_user_id, 'Trưởng bộ môn Khoa CNTT',
     @department_name, 'Tiến sĩ', @department_id, NULL, NULL, NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE
    user_id = VALUES(user_id),
    full_name = VALUES(full_name),
    department = VALUES(department),
    academic_title = VALUES(academic_title),
    department_id = VALUES(department_id);

-- =========================================================
-- 4. GAN TRUONG KHOA VA TRUONG BO MON
-- =========================================================
UPDATE faculty
SET dean_name = 'Trưởng khoa Công nghệ thông tin',
    email = (SELECT email FROM users WHERE user_id = @dean_user_id),
    dean_user_id = @dean_user_id
WHERE faculty_id = @faculty_id;

INSERT INTO head_of_department
    (id, end_date, start_date, status, department_id, lecturer_id)
VALUES
    ('HOD-D001-ACTIVE', NULL, '2026-01-01', 'ACTIVE', @department_id, @hod_lecturer_id)
ON DUPLICATE KEY UPDATE
    end_date = NULL,
    start_date = VALUES(start_date),
    status = 'ACTIVE',
    department_id = VALUES(department_id),
    lecturer_id = VALUES(lecturer_id);

-- =========================================================
-- 5. DONG BO TEN BO MON GIUA USER-SERVICE VA COURSE-SERVICE
-- DepartmentService tra ve 'Khoa CNTT', trong khi courses dang luu 'CNTT'.
-- Neu khong dong bo, dashboard tim khoa hoc theo bo mon se tra ve rong.
-- =========================================================
UPDATE courses
SET department = @department_name,
    department_id = @department_id
WHERE course_id = 'C001';

-- =========================================================
-- 6. TAO MOT RUBRIC R4 DANG PENDING DE KIEM THU LUONG PHE DUYET
-- Khong doi trang thai R1-R3 vi cac rubric nay dang duoc assessment/grade su dung.
-- Neu R4 da duoc phe duyet sau nay, chay lai script se KHONG dua no ve PENDING.
-- =========================================================
INSERT IGNORE INTO rubrics
    (rubric_id, lecturer_id, rubric_name, description, created_at,
     course_id, created_by, feedback, reviewed_at, reviewed_by, status)
VALUES
    ('R4', 'L001',
     'Rubric: Bài thi tự luận lập trình - Chờ phê duyệt',
     'Bản rubric dùng để kiểm tra quy trình gửi, xem xét và phê duyệt rubric của học phần IT101.',
     CURRENT_TIMESTAMP, 'C001', 'Nguyễn Văn A', NULL, CURRENT_TIMESTAMP, NULL, 'PENDING');

-- Sao chep cac tieu chi R2 da chuan hoa sang R4 voi khoa chinh moi.
INSERT IGNORE INTO rubric_criteria
    (criteria_id, rubric_id, clo_id, criteria_name, description, weight)
SELECT
    CONCAT('R4-', rc.criteria_id),
    'R4',
    rc.clo_id,
    rc.criteria_name,
    rc.description,
    rc.weight
FROM rubric_criteria rc
WHERE rc.rubric_id = 'R2';

-- Sao chep day du cac muc danh gia cua R2 sang R4.
INSERT IGNORE INTO rubric_levels
    (level_id, criteria_id, level_name, description, score_percentage, score)
SELECT
    CONCAT('R4-', rl.level_id),
    CONCAT('R4-', rc.criteria_id),
    rl.level_name,
    rl.description,
    rl.score_percentage,
    rl.score
FROM rubric_levels rl
JOIN rubric_criteria rc ON rc.criteria_id = rl.criteria_id
WHERE rc.rubric_id = 'R2';

COMMIT;

-- =========================================================
-- 7. KIEM TRA SAU CAP NHAT
-- =========================================================

-- 7.1 Hai tai khoan phai co role va username duy nhat.
SELECT user_id, username, email, role, full_name, is_locked
FROM users
WHERE user_id IN (@dean_user_id, @hod_user_id)
ORDER BY user_id;

SELECT username, COUNT(*) AS account_count
FROM users
WHERE username IN ('truongkhoa.cntt', 'truongbomon.cntt')
GROUP BY username;

-- 7.2 Moi tai khoan phai co dung mot lecturer thuoc D001.
SELECT l.lecturer_id, l.user_id, u.role, l.full_name,
       d.department_id, d.department_name, f.faculty_id, f.faculty_name
FROM lecturers l
JOIN users u ON u.user_id = l.user_id
JOIN department d ON d.department_id = l.department_id
JOIN faculty f ON f.faculty_id = d.faculty_id
WHERE l.user_id IN (@dean_user_id, @hod_user_id);

-- 7.3 Khoa va bo mon phai tro dung nguoi phu trach.
SELECT f.faculty_id, f.faculty_name, f.dean_name, f.dean_user_id,
       u.role AS dean_role
FROM faculty f
LEFT JOIN users u ON u.user_id = f.dean_user_id
WHERE f.faculty_id = @faculty_id;

SELECT hod.id, hod.status, hod.start_date, hod.end_date,
       hod.department_id, hod.lecturer_id, l.user_id, u.role
FROM head_of_department hod
JOIN lecturers l ON l.lecturer_id = hod.lecturer_id
JOIN users u ON u.user_id = l.user_id
WHERE hod.department_id = @department_id;

-- 7.4 Course C001 phai cung ten bo mon ma user-service tra ve.
SELECT c.course_id, c.course_code, c.course_name, c.department, c.department_id
FROM courses c
WHERE c.course_id = 'C001';

-- 7.5 Truong khoa se thay moi rubric PENDING; truong bo mon se thay rubric
-- PENDING co course_id thuoc bo mon cua minh. Ket qua mong doi co R4.
SELECT r.rubric_id, r.rubric_name, r.course_id, r.created_by,
       r.created_at, r.reviewed_at, r.status,
       COUNT(rc.criteria_id) AS criteria_count,
       ROUND(SUM(rc.weight), 4) AS total_weight
FROM rubrics r
LEFT JOIN rubric_criteria rc ON rc.rubric_id = r.rubric_id
WHERE r.status = 'PENDING'
GROUP BY r.rubric_id, r.rubric_name, r.course_id, r.created_by,
         r.created_at, r.reviewed_at, r.status;

-- 7.6 Phai tra ve 0 dong: tai khoan quan ly chua co lecturer.
SELECT u.user_id, u.username, u.role
FROM users u
LEFT JOIN lecturers l ON l.user_id = u.user_id
WHERE u.role IN ('DEAN', 'HEAD_OF_DEPARTMENT')
  AND l.lecturer_id IS NULL;

SET SQL_SAFE_UPDATES = 1;

-- Sau khi chay: dang xuat va dang nhap lai de JWT/Redis session nhan dung role.
-- Tai khoan:
--   truongkhoa.cntt   (U004 / DEAN)
--   truongbomon.cntt  (U005 / HEAD_OF_DEPARTMENT)
-- Mat khau khong bi thay doi boi script nay.
