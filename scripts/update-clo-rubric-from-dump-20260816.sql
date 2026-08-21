-- Chuan hoa du lieu CLO va Rubric theo dump db_rubric ngay 2026-08-16.
-- Pham vi: khoa hoc C001 / IT101 - Nhap mon lap trinh.
-- Script khong xoa rubric_results, grades, submissions hoac assessment.
-- Khuyen nghi: chay tren ban sao database truoc khi chay tren database chinh.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_520_ci;
SET SQL_SAFE_UPDATES = 0;

SET @course_id = 'C001';
SET @lecturer_id = 'L001';
SET @lecturer_name = 'Nguyễn Văn A';

-- =========================================================
-- 0. KIEM TRA TRUOC KHI CAP NHAT
-- Ket qua mong doi theo dump:
-- - 1 khoa hoc C001
-- - 6 CLO cua C001
-- - 3 rubric R1, R2, R3
-- - tong trong so: R1 = 100 (du lieu cu), R2 = 1, R3 = 1
-- =========================================================
SELECT course_id, course_code, course_name
FROM courses
WHERE course_id = @course_id;

SELECT clo_id, course_id, clo_code, clo_name, bloom_level
FROM course_clo
WHERE course_id = @course_id
ORDER BY clo_code;

SELECT r.rubric_id, r.rubric_name, r.course_id,
       COUNT(rc.criteria_id) AS criteria_count,
       SUM(rc.weight) AS total_weight
FROM rubrics r
LEFT JOIN rubric_criteria rc ON rc.rubric_id = r.rubric_id
WHERE r.rubric_id IN ('R1', 'R2', 'R3')
GROUP BY r.rubric_id, r.rubric_name, r.course_id;

-- =========================================================
-- 1. BACKUP MOT LAN
-- Neu cac bang backup da ton tai, INSERT IGNORE se giu ban backup dau tien.
-- =========================================================
CREATE TABLE IF NOT EXISTS backup_20260816_course_clo LIKE course_clo;
INSERT IGNORE INTO backup_20260816_course_clo
SELECT * FROM course_clo WHERE course_id = @course_id;

CREATE TABLE IF NOT EXISTS backup_20260816_rubrics LIKE rubrics;
INSERT IGNORE INTO backup_20260816_rubrics
SELECT * FROM rubrics WHERE rubric_id IN ('R1', 'R2', 'R3');

CREATE TABLE IF NOT EXISTS backup_20260816_rubric_criteria LIKE rubric_criteria;
INSERT IGNORE INTO backup_20260816_rubric_criteria
SELECT * FROM rubric_criteria WHERE rubric_id IN ('R1', 'R2', 'R3');

CREATE TABLE IF NOT EXISTS backup_20260816_rubric_levels LIKE rubric_levels;
INSERT IGNORE INTO backup_20260816_rubric_levels
SELECT rl.*
FROM rubric_levels rl
JOIN rubric_criteria rc ON rc.criteria_id = rl.criteria_id
WHERE rc.rubric_id IN ('R1', 'R2', 'R3');

CREATE TABLE IF NOT EXISTS backup_20260816_assessment_clo LIKE assessment_clo;
INSERT IGNORE INTO backup_20260816_assessment_clo
SELECT ac.*
FROM assessment_clo ac
JOIN assessments a ON a.assessment_id = ac.assessment_id
JOIN course_offerings co ON co.offering_id = a.offering_id
WHERE co.course_id = @course_id;

START TRANSACTION;

-- =========================================================
-- 2. CHUAN HOA 6 CLO CUA IT101
-- Giu nguyen clo_id de khong lam hong cac khoa ngoai hien co.
-- =========================================================
UPDATE course_clo
SET
    course_id = @course_id,
    clo_name = CASE clo_code
        WHEN 'CLO1' THEN 'Kiến thức lập trình nền tảng'
        WHEN 'CLO2' THEN 'Xây dựng thuật toán cơ bản'
        WHEN 'CLO3' THEN 'Phát triển chương trình có cấu trúc'
        WHEN 'CLO4' THEN 'Kiểm thử và gỡ lỗi chương trình'
        WHEN 'CLO5' THEN 'Hợp tác và thực hiện trách nhiệm'
        WHEN 'CLO6' THEN 'Tài liệu hóa và trình bày giải pháp'
    END,
    description = CASE clo_code
        WHEN 'CLO1' THEN 'Giải thích được các khái niệm nền tảng về biến, kiểu dữ liệu, toán tử, cấu trúc điều khiển và hàm.'
        WHEN 'CLO2' THEN 'Xây dựng được thuật toán cơ bản và biểu diễn lời giải bằng lưu đồ hoặc mã giả trước khi lập trình.'
        WHEN 'CLO3' THEN 'Vận dụng cấu trúc điều khiển, hàm, mảng và chuỗi để phát triển chương trình có cấu trúc giải quyết bài toán cơ bản.'
        WHEN 'CLO4' THEN 'Phân tích lỗi, xây dựng dữ liệu kiểm thử và gỡ lỗi để bảo đảm chương trình hoạt động đúng yêu cầu.'
        WHEN 'CLO5' THEN 'Thực hiện nhiệm vụ cá nhân có trách nhiệm, phối hợp nhóm và quản lý tiến độ trong bài tập hoặc đồ án lập trình.'
        WHEN 'CLO6' THEN 'Viết tài liệu và trình bày rõ ràng thuật toán, mã nguồn, kết quả kiểm thử và giải pháp đã xây dựng.'
    END,
    bloom_level = CASE clo_code
        WHEN 'CLO1' THEN 'Hiểu'
        WHEN 'CLO2' THEN 'Vận dụng'
        WHEN 'CLO3' THEN 'Vận dụng'
        WHEN 'CLO4' THEN 'Phân tích'
        WHEN 'CLO5' THEN 'Vận dụng'
        WHEN 'CLO6' THEN 'Vận dụng'
    END
WHERE course_id = @course_id
  AND clo_code IN ('CLO1', 'CLO2', 'CLO3', 'CLO4', 'CLO5', 'CLO6');

-- =========================================================
-- 3. GAN RUBRIC VE DUNG KHOA HOC VA GIANG VIEN
-- R1/R2/R3 trong dump deu la rubric cua C001, giang vien phu trach O001 la L001.
-- =========================================================
UPDATE rubrics
SET course_id = @course_id,
    lecturer_id = @lecturer_id,
    created_by = COALESCE(NULLIF(created_by, ''), @lecturer_name)
WHERE rubric_id IN ('R1', 'R2', 'R3');

UPDATE rubrics
SET rubric_name = 'Rubric: Đánh giá bài thi tự luận lập trình',
    description = 'Đánh giá kiến thức nền tảng, khả năng phân tích thuật toán, xây dựng lời giải và trình bày bài thi tự luận.'
WHERE rubric_id = 'R2';

-- =========================================================
-- 4. CHUAN HOA TIEU CHI RUBRIC -> CLO
-- Trong backend/frontend, trong so rubric duoc luu theo ty le 0..1.
-- =========================================================
UPDATE rubric_criteria
SET
    clo_id = CASE criteria_id
        WHEN 'C1' THEN '5dde1db3-a7ff-4c73-9cdf-c75f477798c5' -- CLO5: trach nhiem
        WHEN 'C2' THEN '5dde1db3-a7ff-4c73-9cdf-c75f477798c5' -- CLO5: thai do/hop tac
        WHEN 'C3' THEN '72f408ae-d368-4e64-adce-c3574c288242' -- CLO2: thuat toan
        WHEN 'C4' THEN '5dde1db3-a7ff-4c73-9cdf-c75f477798c5' -- CLO5: tien do
        WHEN 'C5' THEN '5dde1db3-a7ff-4c73-9cdf-c75f477798c5' -- CLO5: lam viec nhom
        WHEN 'C6' THEN '5d1b8375-b60a-4fdb-8569-5a790fd6188d' -- CLO3: san pham chuong trinh
        WHEN 'C7' THEN 'd3bc40af-22d0-43b6-a065-9e4a3216e5e6' -- CLO6: tai lieu
        WHEN 'C8' THEN 'd3bc40af-22d0-43b6-a065-9e4a3216e5e6' -- CLO6: trinh bay
        WHEN 'C9' THEN 'CLO1'                                -- CLO1: giai thich/tra loi
    END,
    description = CASE criteria_id
        WHEN 'C1' THEN 'Mức độ tham gia đầy đủ và thực hiện trách nhiệm học tập.'
        WHEN 'C2' THEN 'Thái độ chủ động, hợp tác và tuân thủ quy định lớp học.'
        WHEN 'C3' THEN 'Khả năng phân tích yêu cầu, xác định dữ liệu vào/ra và xây dựng thuật toán phù hợp.'
        WHEN 'C4' THEN 'Khả năng lập kế hoạch và hoàn thành các mốc công việc đúng tiến độ.'
        WHEN 'C5' THEN 'Mức độ phối hợp, chia sẻ công việc và đóng góp cho nhóm.'
        WHEN 'C6' THEN 'Mức độ đúng đắn, đầy đủ, có cấu trúc và ổn định của chương trình.'
        WHEN 'C7' THEN 'Mức độ đầy đủ, chính xác và rõ ràng của tài liệu kỹ thuật.'
        WHEN 'C8' THEN 'Khả năng trình bày, minh họa và demo giải pháp.'
        WHEN 'C9' THEN 'Khả năng giải thích lựa chọn kỹ thuật và trả lời câu hỏi phản biện.'
    END,
    weight = CASE criteria_id
        WHEN 'C1' THEN 0.80
        WHEN 'C2' THEN 0.20
        WHEN 'C3' THEN 0.30
        WHEN 'C4' THEN 0.05
        WHEN 'C5' THEN 0.05
        WHEN 'C6' THEN 0.50
        WHEN 'C7' THEN 0.10
        WHEN 'C8' THEN 0.10
        WHEN 'C9' THEN 0.20
    END
WHERE rubric_id IN ('R1', 'R2', 'R3')
  AND criteria_id IN ('C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9');

-- R2 trong dump chi co mot tieu chi chung chung. Bo sung rubric bai thi tu luan
-- thanh 4 thanh phan, tong trong so bang 1 va bao phu 4 CLO lien quan.
UPDATE rubric_criteria
SET criteria_name = 'Phân tích đề bài và xây dựng thuật toán'
WHERE criteria_id = 'C3' AND rubric_id = 'R2';

INSERT INTO rubric_criteria
    (criteria_id, rubric_id, clo_id, criteria_name, description, weight)
VALUES
    (
        'R2-C10', 'R2', 'CLO1',
        'Kiến thức lập trình nền tảng',
        'Mức độ hiểu đúng khái niệm, cú pháp, kiểu dữ liệu, cấu trúc điều khiển và nguyên lý lập trình được hỏi trong đề.',
        0.20
    ),
    (
        'R2-C11', 'R2', '5d1b8375-b60a-4fdb-8569-5a790fd6188d',
        'Vận dụng kiến thức để xây dựng lời giải',
        'Mức độ đúng đắn và đầy đủ khi vận dụng hàm, mảng, chuỗi hoặc cấu trúc dữ liệu phù hợp để giải quyết bài toán.',
        0.40
    ),
    (
        'R2-C12', 'R2', 'd3bc40af-22d0-43b6-a065-9e4a3216e5e6',
        'Lập luận và trình bày bài làm',
        'Bài làm được trình bày có cấu trúc, giải thích rõ các bước, ký hiệu nhất quán và dễ kiểm tra.',
        0.10
    )
ON DUPLICATE KEY UPDATE
    rubric_id = VALUES(rubric_id),
    clo_id = VALUES(clo_id),
    criteria_name = VALUES(criteria_name),
    description = VALUES(description),
    weight = VALUES(weight);

-- =========================================================
-- 5. CHUAN HOA THANG DIEM CAC MUC RUBRIC
-- Moi tieu chi dung chung thang 10: Tot 10, Kha 8, Trung binh 6, Kem 3.
-- Giu nguyen level_id de bao toan rubric_results lich su.
-- =========================================================
UPDATE rubric_levels rl
JOIN rubric_criteria rc ON rc.criteria_id = rl.criteria_id
SET
    rl.level_name = CASE
        WHEN LOWER(TRIM(rl.level_name)) = 'tốt' THEN 'Tốt'
        WHEN LOWER(TRIM(rl.level_name)) = 'khá' THEN 'Khá'
        WHEN LOWER(TRIM(rl.level_name)) = 'trung bình' THEN 'Trung bình'
        WHEN LOWER(TRIM(rl.level_name)) = 'kém' THEN 'Kém'
        ELSE rl.level_name
    END,
    rl.score_percentage = CASE
        WHEN LOWER(TRIM(rl.level_name)) = 'tốt' THEN 100
        WHEN LOWER(TRIM(rl.level_name)) = 'khá' THEN 80
        WHEN LOWER(TRIM(rl.level_name)) = 'trung bình' THEN 60
        WHEN LOWER(TRIM(rl.level_name)) = 'kém' THEN 30
        ELSE rl.score_percentage
    END,
    rl.score = CASE
        WHEN LOWER(TRIM(rl.level_name)) = 'tốt' THEN 10
        WHEN LOWER(TRIM(rl.level_name)) = 'khá' THEN 8
        WHEN LOWER(TRIM(rl.level_name)) = 'trung bình' THEN 6
        WHEN LOWER(TRIM(rl.level_name)) = 'kém' THEN 3
        ELSE rl.score
    END
WHERE rc.rubric_id IN ('R1', 'R2', 'R3');

-- Bo sung day du 4 muc danh gia cho tat ca tieu chi cua R2.
INSERT INTO rubric_levels
    (level_id, criteria_id, level_name, description, score_percentage, score)
VALUES
    ('R2-C3-TOT', 'C3', 'Tốt', 'Phân tích đúng bài toán, xây dựng thuật toán hợp lý và vận dụng chính xác.', 100, 10),
    ('R2-C3-KHA', 'C3', 'Khá', 'Phân tích được bài toán và xây dựng thuật toán cơ bản, còn lỗi nhỏ.', 80, 8),
    ('R2-C3-TB',  'C3', 'Trung bình', 'Nắm được yêu cầu chính nhưng thuật toán hoặc cách vận dụng còn thiếu sót.', 60, 6),
    ('R2-C3-KEM', 'C3', 'Kém', 'Chưa phân tích được bài toán hoặc chưa xây dựng được thuật toán phù hợp.', 30, 3),

    ('R2-C10-TOT', 'R2-C10', 'Tốt', 'Giải thích chính xác, đầy đủ các khái niệm và không có sai sót bản chất.', 100, 10),
    ('R2-C10-KHA', 'R2-C10', 'Khá', 'Hiểu đúng phần lớn khái niệm, chỉ có một vài thiếu sót nhỏ.', 80, 8),
    ('R2-C10-TB',  'R2-C10', 'Trung bình', 'Nắm được kiến thức cốt lõi nhưng giải thích còn thiếu hoặc chưa chính xác ở một số phần.', 60, 6),
    ('R2-C10-KEM', 'R2-C10', 'Kém', 'Nhầm lẫn kiến thức nền tảng hoặc không giải thích được nội dung chính.', 30, 3),

    ('R2-C11-TOT', 'R2-C11', 'Tốt', 'Lời giải đúng, đầy đủ, có cấu trúc tốt và xử lý được các trường hợp quan trọng.', 100, 10),
    ('R2-C11-KHA', 'R2-C11', 'Khá', 'Lời giải cơ bản đúng và hợp lý, còn lỗi nhỏ không làm thay đổi hướng giải quyết.', 80, 8),
    ('R2-C11-TB',  'R2-C11', 'Trung bình', 'Có hướng giải phù hợp nhưng triển khai chưa đầy đủ hoặc còn lỗi đáng kể.', 60, 6),
    ('R2-C11-KEM', 'R2-C11', 'Kém', 'Không xây dựng được lời giải khả thi hoặc lời giải sai phần lớn yêu cầu.', 30, 3),

    ('R2-C12-TOT', 'R2-C12', 'Tốt', 'Lập luận mạch lạc, trình bày khoa học, ký hiệu nhất quán và dễ kiểm tra.', 100, 10),
    ('R2-C12-KHA', 'R2-C12', 'Khá', 'Trình bày rõ phần lớn nội dung, còn một số điểm chưa chặt chẽ.', 80, 8),
    ('R2-C12-TB',  'R2-C12', 'Trung bình', 'Trình bày được các bước chính nhưng diễn giải còn rời rạc hoặc khó theo dõi.', 60, 6),
    ('R2-C12-KEM', 'R2-C12', 'Kém', 'Bài làm thiếu cấu trúc, không giải thích các bước hoặc trình bày không thể kiểm tra.', 30, 3)
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    score_percentage = VALUES(score_percentage),
    score = VALUES(score);

-- =========================================================
-- 6. XAY LAI ASSESSMENT_CLO CHO CAC ASSESSMENT DA GAN RUBRIC R1/R2/R3
-- clo_weight duoc phan bo theo tong trong so tieu chi cua tung CLO.
-- Khong tu dong gan rubric cho assessment dang rubric_id = NULL.
-- =========================================================
DELETE ac
FROM assessment_clo ac
JOIN assessments a ON a.assessment_id = ac.assessment_id
JOIN course_offerings co ON co.offering_id = a.offering_id
WHERE co.course_id = @course_id
  AND a.rubric_id IN ('R1', 'R2', 'R3');

INSERT INTO assessment_clo
    (assessment_id, clo_id, clo_weight, assessment_clo_id)
SELECT
    a.assessment_id,
    rc.clo_id,
    ROUND(
        COALESCE(a.weight, 0) * SUM(rc.weight) / NULLIF(rubric_total.total_weight, 0),
        4
    ) AS clo_weight,
    CONCAT('AC-', MD5(CONCAT(a.assessment_id, ':', rc.clo_id))) AS assessment_clo_id
FROM assessments a
JOIN course_offerings co ON co.offering_id = a.offering_id
JOIN rubric_criteria rc ON rc.rubric_id = a.rubric_id
JOIN (
    SELECT rubric_id, SUM(weight) AS total_weight
    FROM rubric_criteria
    WHERE rubric_id IN ('R1', 'R2', 'R3')
    GROUP BY rubric_id
) rubric_total ON rubric_total.rubric_id = a.rubric_id
WHERE co.course_id = @course_id
  AND a.rubric_id IN ('R1', 'R2', 'R3')
  AND rc.clo_id IS NOT NULL
GROUP BY a.assessment_id, a.weight, rc.clo_id, rubric_total.total_weight;

COMMIT;

-- =========================================================
-- 7. KIEM TRA SAU CAP NHAT
-- Moi truy van duoi day phai tra ve ket qua hop le/0 dong loi.
-- =========================================================

-- 7.1 Danh sach CLO chuan cua C001.
SELECT clo_id, course_id, clo_code, clo_name, bloom_level, description
FROM course_clo
WHERE course_id = @course_id
ORDER BY clo_code;

-- 7.2 Moi rubric phai thuoc C001 va tong trong so phai bang 1.
SELECT r.rubric_id, r.rubric_name, r.course_id, r.lecturer_id,
       COUNT(rc.criteria_id) AS criteria_count,
       ROUND(SUM(rc.weight), 4) AS total_weight
FROM rubrics r
JOIN rubric_criteria rc ON rc.rubric_id = r.rubric_id
WHERE r.rubric_id IN ('R1', 'R2', 'R3')
GROUP BY r.rubric_id, r.rubric_name, r.course_id, r.lecturer_id;

-- 7.3 Chi tiet mapping Rubric -> Criteria -> CLO.
SELECT r.rubric_id, rc.criteria_id, rc.criteria_name, rc.weight,
       c.clo_code, c.clo_name, c.course_id
FROM rubrics r
JOIN rubric_criteria rc ON rc.rubric_id = r.rubric_id
LEFT JOIN course_clo c ON c.clo_id = rc.clo_id
WHERE r.rubric_id IN ('R1', 'R2', 'R3')
ORDER BY r.rubric_id, rc.criteria_id;

-- 7.4 Phan bo CLO cua moi assessment phai cong lai bang assessment.weight.
SELECT a.assessment_id, a.assessment_name, a.rubric_id, a.weight,
       ROUND(SUM(ac.clo_weight), 4) AS mapped_clo_weight
FROM assessments a
JOIN course_offerings co ON co.offering_id = a.offering_id
LEFT JOIN assessment_clo ac ON ac.assessment_id = a.assessment_id
WHERE co.course_id = @course_id
  AND a.rubric_id IN ('R1', 'R2', 'R3')
GROUP BY a.assessment_id, a.assessment_name, a.rubric_id, a.weight;

-- 7.5 Phai tra ve 0 dong: criterion va level trong ket qua lich su khong cung tieu chi.
SELECT rr.result_id, rr.criteria_id, rr.level_id, rl.criteria_id AS level_criteria_id
FROM rubric_results rr
JOIN rubric_levels rl ON rl.level_id = rr.level_id
WHERE rr.level_id IS NOT NULL
  AND rr.criteria_id <> rl.criteria_id;

-- 7.6 Can xem thu cong: assessment co submission dung rubric nhung assessment.rubric_id dang NULL.
-- Dump hien tai co assessment 58ff... nam trong nhom nay; script khong tu quyet dinh gan de tranh sai nghiep vu.
SELECT a.assessment_id, a.assessment_name, a.weight, a.rubric_id,
       GROUP_CONCAT(DISTINCT s.rubric_id ORDER BY s.rubric_id) AS submission_rubrics,
       COUNT(*) AS submission_count
FROM assessments a
JOIN course_offerings co ON co.offering_id = a.offering_id
JOIN submissions s ON s.assessment_id = a.assessment_id
WHERE co.course_id = @course_id
  AND a.rubric_id IS NULL
  AND s.rubric_id IS NOT NULL
  AND TRIM(s.rubric_id) <> ''
GROUP BY a.assessment_id, a.assessment_name, a.weight, a.rubric_id;

-- 7.7 Can xem thu cong: tong trong so assessment duong cua offering.
-- Dump O001 hien tai co tong lon hon 100; day la loi du lieu assessment rieng,
-- khong nen tu sua trong migration CLO/Rubric khi chua xac dinh assessment nao la ban cu.
SELECT a.offering_id, SUM(CASE WHEN a.weight > 0 THEN a.weight ELSE 0 END) AS total_assessment_weight
FROM assessments a
WHERE a.offering_id = 'O001'
GROUP BY a.offering_id;

SET SQL_SAFE_UPDATES = 1;

-- Khoi phuc neu can (chi chay sau khi da danh gia tac dong):
-- START TRANSACTION;
-- DELETE FROM assessment_clo WHERE assessment_id IN
--   (SELECT assessment_id FROM assessments WHERE offering_id = 'O001');
-- INSERT INTO assessment_clo SELECT * FROM backup_20260816_assessment_clo;
-- UPDATE course_clo c JOIN backup_20260816_course_clo b ON b.clo_id = c.clo_id
--   SET c.course_id=b.course_id, c.clo_code=b.clo_code, c.description=b.description,
--       c.bloom_level=b.bloom_level, c.clo_name=b.clo_name;
-- UPDATE rubrics r JOIN backup_20260816_rubrics b ON b.rubric_id = r.rubric_id
--   SET r.lecturer_id=b.lecturer_id, r.rubric_name=b.rubric_name,
--       r.description=b.description, r.course_id=b.course_id, r.created_by=b.created_by,
--       r.feedback=b.feedback, r.reviewed_at=b.reviewed_at, r.reviewed_by=b.reviewed_by,
--       r.status=b.status;
-- UPDATE rubric_criteria rc JOIN backup_20260816_rubric_criteria b ON b.criteria_id=rc.criteria_id
--   SET rc.rubric_id=b.rubric_id, rc.clo_id=b.clo_id, rc.criteria_name=b.criteria_name,
--       rc.description=b.description, rc.weight=b.weight;
-- DELETE FROM rubric_levels WHERE criteria_id IN ('R2-C10', 'R2-C11', 'R2-C12');
-- DELETE FROM rubric_criteria WHERE criteria_id IN ('R2-C10', 'R2-C11', 'R2-C12');
-- COMMIT;
