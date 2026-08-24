-- Seed 2 lop hoc phan day du du lieu CLO/OBE cho MariaDB da tach service.
-- Du lieu sinh vien duoc lay tu db_user.sinh_vien (30 sinh vien that dau tien).
-- Khong tao rubric moi: tai su dung R2 va R3 dang co trong he thong.
-- Script co the chay lai: cac ban ghi co khoa duoc cap nhat, Grades duoc tao lai
-- chi trong pham vi submission cua O002 va O003.

SET NAMES utf8mb4;
USE db_course;

-- Ho tro mo hinh mot lop co giang vien chinh va nhieu tro giang.
ALTER TABLE db_course.course_offerings
    ADD COLUMN IF NOT EXISTS main_lecturer_id VARCHAR(50) NULL AFTER lecturer_id;

CREATE TABLE IF NOT EXISTS db_course.course_offering_teaching_assistants (
    offering_id VARCHAR(50) NOT NULL,
    lecturer_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (offering_id, lecturer_id),
    KEY idx_cota_lecturer (lecturer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS db_course.assessment_criterion_clo (
    mapping_id VARCHAR(100) NOT NULL,
    assessment_id VARCHAR(50) NOT NULL,
    criteria_id VARCHAR(50) NOT NULL,
    clo_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (mapping_id),
    UNIQUE KEY uk_assessment_criterion_clo (assessment_id, criteria_id, clo_id),
    KEY idx_acc_clo (clo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

DROP TEMPORARY TABLE IF EXISTS seed_students;
CREATE TEMPORARY TABLE seed_students (
    student_id VARCHAR(50) NOT NULL PRIMARY KEY
);

INSERT INTO seed_students (student_id)
SELECT student_id
FROM db_user.sinh_vien
ORDER BY student_id
LIMIT 30;

-- Dung ngay neu database khong du 30 sinh vien that.
DROP PROCEDURE IF EXISTS db_course.assert_obe_seed_prerequisites;
DELIMITER //
CREATE PROCEDURE db_course.assert_obe_seed_prerequisites()
BEGIN
    IF (SELECT COUNT(*) FROM seed_students) <> 30 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Can it nhat 30 sinh vien trong db_user.sinh_vien de seed O002/O003';
    END IF;
    IF (SELECT COUNT(*) FROM db_rubric_service.rubrics WHERE rubric_id IN ('R2', 'R3')) <> 2 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Can co san rubric R2 va R3; script nay khong tao rubric moi';
    END IF;
END//
DELIMITER ;
CALL db_course.assert_obe_seed_prerequisites();
DROP PROCEDURE db_course.assert_obe_seed_prerequisites;

-- 1. Khoa hoc va lop hoc phan
INSERT INTO db_course.courses
    (course_id, course_code, course_name, credits, description, department, syllabus_url, department_id)
VALUES
    ('C002', 'DBS201', 'Cơ sở dữ liệu', 3,
     'Thiết kế, truy vấn và quản trị cơ sở dữ liệu quan hệ theo chuẩn đầu ra OBE.',
     'Khoa CNTT', NULL, 'D001'),
    ('C003', 'SE301', 'Công nghệ phần mềm', 3,
     'Phân tích yêu cầu, thiết kế, kiểm thử và quản lý dự án phần mềm theo chuẩn đầu ra OBE.',
     'Khoa CNTT', NULL, 'D001')
ON DUPLICATE KEY UPDATE
    course_code = VALUES(course_code),
    course_name = VALUES(course_name),
    credits = VALUES(credits),
    description = VALUES(description),
    department = VALUES(department),
    department_id = VALUES(department_id);

INSERT INTO db_course.course_offerings
    (offering_id, course_id, lecturer_id, main_lecturer_id, semester, academic_year,
     max_students, start_date, end_date, status, offering_name,
     assignment_score_weight, attendance_score_weight, banner_color, banner_image_url)
VALUES
    ('O002', 'C002', 'L002', 'L002', 'HK1', '2025-2026', 30,
     '2025-09-05', '2026-01-10', 'OPEN', 'Cơ sở dữ liệu - Nhóm 01',
     40, 10, '#2563EB', NULL),
    ('O003', 'C003', 'L002', 'L002', 'HK1', '2025-2026', 30,
     '2025-09-06', '2026-01-11', 'OPEN', 'Công nghệ phần mềm - Nhóm 01',
     40, 10, '#7C3AED', NULL)
ON DUPLICATE KEY UPDATE
    course_id = VALUES(course_id),
    lecturer_id = VALUES(lecturer_id),
    main_lecturer_id = VALUES(main_lecturer_id),
    semester = VALUES(semester),
    academic_year = VALUES(academic_year),
    max_students = VALUES(max_students),
    start_date = VALUES(start_date),
    end_date = VALUES(end_date),
    status = VALUES(status),
    offering_name = VALUES(offering_name),
    assignment_score_weight = VALUES(assignment_score_weight),
    attendance_score_weight = VALUES(attendance_score_weight),
    banner_color = VALUES(banner_color);

-- L002 la giang vien chinh; L001 la tro giang. Bang lecturers tong hop ca hai.
DELETE FROM db_course.course_offering_lecturers WHERE offering_id IN ('O002', 'O003');
INSERT INTO db_course.course_offering_lecturers (offering_id, lecturer_id) VALUES
    ('O002', 'L002'), ('O002', 'L001'),
    ('O003', 'L002'), ('O003', 'L001');

DELETE FROM db_course.course_offering_teaching_assistants WHERE offering_id IN ('O002', 'O003');
INSERT INTO db_course.course_offering_teaching_assistants (offering_id, lecturer_id) VALUES
    ('O002', 'L001'),
    ('O003', 'L001');

-- 2. CLO cua tung khoa hoc
INSERT INTO db_course.course_clo
    (clo_id, course_id, clo_code, description, bloom_level, clo_name)
VALUES
    ('C002-CLO1', 'C002', 'CLO1',
     'Giải thích mô hình dữ liệu quan hệ, khóa và các ràng buộc toàn vẹn.', 'Hiểu',
     'Kiến thức nền tảng cơ sở dữ liệu'),
    ('C002-CLO2', 'C002', 'CLO2',
     'Thiết kế và chuẩn hóa cơ sở dữ liệu từ yêu cầu nghiệp vụ.', 'Phân tích',
     'Thiết kế và chuẩn hóa dữ liệu'),
    ('C002-CLO3', 'C002', 'CLO3',
     'Xây dựng truy vấn SQL và tối ưu thao tác dữ liệu cho bài toán thực tế.', 'Vận dụng',
     'Xây dựng và tối ưu truy vấn SQL'),
    ('C003-CLO1', 'C003', 'CLO1',
     'Phân tích và đặc tả yêu cầu của một hệ thống phần mềm.', 'Phân tích',
     'Phân tích yêu cầu phần mềm'),
    ('C003-CLO2', 'C003', 'CLO2',
     'Thiết kế kiến trúc và mô hình hệ thống đáp ứng yêu cầu đã xác định.', 'Sáng tạo',
     'Thiết kế hệ thống phần mềm'),
    ('C003-CLO3', 'C003', 'CLO3',
     'Xây dựng kế hoạch kiểm thử, quản lý tiến độ và đánh giá chất lượng sản phẩm.', 'Đánh giá',
     'Kiểm thử và quản lý chất lượng')
ON DUPLICATE KEY UPDATE
    course_id = VALUES(course_id),
    clo_code = VALUES(clo_code),
    description = VALUES(description),
    bloom_level = VALUES(bloom_level),
    clo_name = VALUES(clo_name);

INSERT INTO db_course.course_clo_map (course_id, clo_id)
VALUES
    ('C002', 'C002-CLO1'), ('C002', 'C002-CLO2'), ('C002', 'C002-CLO3'),
    ('C003', 'C003-CLO1'), ('C003', 'C003-CLO2'), ('C003', 'C003-CLO3')
ON DUPLICATE KEY UPDATE course_id = VALUES(course_id);

-- 3. Tai su dung rubric hien co: R2 cho CSDL, R3 cho Cong nghe phan mem.
-- Chi bo sung tieu chi gan CLO moi, khong INSERT them ban ghi vao bang rubrics.
INSERT INTO db_rubric_service.rubric_criteria
    (criteria_id, rubric_id, clo_id, criteria_name, description, weight)
VALUES
    ('RC-C002-1', 'R2', NULL, 'Hiểu mô hình dữ liệu',
     'Giải thích đúng mô hình quan hệ, khóa và ràng buộc.', 1.0),
    ('RC-C002-2', 'R2', NULL, 'Thiết kế cơ sở dữ liệu',
     'Mô hình hóa đúng nghiệp vụ và chuẩn hóa lược đồ.', 1.0),
    ('RC-C002-3', 'R2', NULL, 'Xây dựng truy vấn SQL',
     'Truy vấn đúng, rõ ràng và có xem xét hiệu năng.', 1.0),
    ('RC-C003-1', 'R3', NULL, 'Phân tích yêu cầu',
     'Yêu cầu đầy đủ, nhất quán, có tiêu chí chấp nhận.', 1.0),
    ('RC-C003-2', 'R3', NULL, 'Thiết kế hệ thống',
     'Kiến trúc và mô hình thiết kế phù hợp yêu cầu.', 1.0),
    ('RC-C003-3', 'R3', NULL, 'Kiểm thử và quản lý chất lượng',
     'Kế hoạch kiểm thử và theo dõi chất lượng có căn cứ.', 1.0)
ON DUPLICATE KEY UPDATE
    rubric_id = VALUES(rubric_id),
    clo_id = VALUES(clo_id),
    criteria_name = VALUES(criteria_name),
    description = VALUES(description),
    weight = VALUES(weight);

INSERT INTO db_rubric_service.rubric_levels
    (level_id, criteria_id, level_name, description, score_percentage, score)
SELECT CONCAT(c.criteria_id, '-L', n.level_no), c.criteria_id, n.level_name,
       n.level_description, n.score_percentage, n.score
FROM (
    SELECT 'RC-C002-1' AS criteria_id UNION ALL SELECT 'RC-C002-2' UNION ALL
    SELECT 'RC-C002-3' UNION ALL SELECT 'RC-C003-1' UNION ALL
    SELECT 'RC-C003-2' UNION ALL SELECT 'RC-C003-3'
) c
CROSS JOIN (
    SELECT 1 AS level_no, 'Chưa đạt' AS level_name,
           'Chưa đáp ứng yêu cầu cơ bản.' AS level_description, 25 AS score_percentage, 2.5 AS score
    UNION ALL SELECT 2, 'Đạt', 'Đáp ứng yêu cầu cơ bản nhưng còn thiếu sót.', 50, 5.0
    UNION ALL SELECT 3, 'Tốt', 'Đáp ứng tốt phần lớn yêu cầu.', 75, 7.5
    UNION ALL SELECT 4, 'Xuất sắc', 'Đáp ứng đầy đủ và có chất lượng cao.', 100, 10.0
) n
WHERE 1 = 1
ON DUPLICATE KEY UPDATE
    level_name = VALUES(level_name),
    description = VALUES(description),
    score_percentage = VALUES(score_percentage),
    score = VALUES(score);

-- 4. Bai tap do giang vien tao va anh xa CLO.
INSERT INTO db_course.assessments
    (assessment_id, offering_id, rubric_id, assessment_name, description,
     assessment_type, weight, start_time, end_time, file_url, duration_minutes)
VALUES
    ('A-C002-01', 'O002', 'R2', 'Bài tập thiết kế cơ sở dữ liệu',
     'Phân tích yêu cầu, xây dựng ERD và chuyển sang lược đồ quan hệ.',
     'ASSIGNMENT', 40, '2025-10-01 07:00:00', '2025-10-15 23:59:00', NULL, NULL),
    ('A-C002-02', 'O002', 'R2', 'Đồ án truy vấn và tối ưu SQL',
     'Cài đặt cơ sở dữ liệu, truy vấn báo cáo và phân tích kế hoạch thực thi.',
     'PROJECT', 60, '2025-11-01 07:00:00', '2025-12-15 23:59:00', NULL, NULL),
    ('A-C003-01', 'O003', 'R3', 'Bài tập phân tích yêu cầu',
     'Xây dựng đặc tả yêu cầu và tiêu chí chấp nhận cho hệ thống LMS.',
     'ASSIGNMENT', 40, '2025-10-02 07:00:00', '2025-10-20 23:59:00', NULL, NULL),
    ('A-C003-02', 'O003', 'R3', 'Đồ án thiết kế và kiểm thử phần mềm',
     'Thiết kế kiến trúc, hiện thực nguyên mẫu và lập kế hoạch kiểm thử.',
     'PROJECT', 60, '2025-11-02 07:00:00', '2025-12-20 23:59:00', NULL, NULL)
ON DUPLICATE KEY UPDATE
    offering_id = VALUES(offering_id),
    rubric_id = VALUES(rubric_id),
    assessment_name = VALUES(assessment_name),
    description = VALUES(description),
    assessment_type = VALUES(assessment_type),
    weight = VALUES(weight),
    start_time = VALUES(start_time),
    end_time = VALUES(end_time);

INSERT INTO db_course.assessment_clo
    (assessment_id, clo_id, clo_weight, assessment_clo_id)
VALUES
    ('A-C002-01', 'C002-CLO1', 60, 'AC-C002-01-1'),
    ('A-C002-01', 'C002-CLO2', 40, 'AC-C002-01-2'),
    ('A-C002-02', 'C002-CLO2', 40, 'AC-C002-02-2'),
    ('A-C002-02', 'C002-CLO3', 60, 'AC-C002-02-3'),
    ('A-C003-01', 'C003-CLO1', 60, 'AC-C003-01-1'),
    ('A-C003-01', 'C003-CLO2', 40, 'AC-C003-01-2'),
    ('A-C003-02', 'C003-CLO2', 40, 'AC-C003-02-2'),
    ('A-C003-02', 'C003-CLO3', 60, 'AC-C003-02-3')
ON DUPLICATE KEY UPDATE
    clo_weight = VALUES(clo_weight),
    assessment_clo_id = VALUES(assessment_clo_id);

-- CLO duoc gan theo ngu canh bai danh gia, khong luu trong rubric dung chung.
INSERT INTO db_course.assessment_criterion_clo
    (mapping_id, assessment_id, criteria_id, clo_id)
VALUES
    ('ACC-C002-01-1', 'A-C002-01', 'RC-C002-1', 'C002-CLO1'),
    ('ACC-C002-01-2', 'A-C002-01', 'RC-C002-2', 'C002-CLO2'),
    ('ACC-C002-02-2', 'A-C002-02', 'RC-C002-2', 'C002-CLO2'),
    ('ACC-C002-02-3', 'A-C002-02', 'RC-C002-3', 'C002-CLO3'),
    ('ACC-C003-01-1', 'A-C003-01', 'RC-C003-1', 'C003-CLO1'),
    ('ACC-C003-01-2', 'A-C003-01', 'RC-C003-2', 'C003-CLO2'),
    ('ACC-C003-02-2', 'A-C003-02', 'RC-C003-2', 'C003-CLO2'),
    ('ACC-C003-02-3', 'A-C003-02', 'RC-C003-3', 'C003-CLO3')
ON DUPLICATE KEY UPDATE
    assessment_id = VALUES(assessment_id),
    criteria_id = VALUES(criteria_id),
    clo_id = VALUES(clo_id);

-- 5. Moi lop dung dung 30 sinh vien that va co diem tong hop.
INSERT INTO db_course.enrollments
    (enrollment_id, student_id, offering_id, enrollment_date, status,
     midterm_score, final_score, total_score, letter_grade, last_read_time,
     role, assignment_score, attendance_score, attendance_warning_count)
SELECT CONCAT('ENR-O002-', s.student_id), s.student_id, 'O002', '2025-09-01 08:00:00', 'ACTIVE',
       ROUND(6.5 + MOD(CAST(RIGHT(s.student_id, 2) AS UNSIGNED), 10) * 0.28, 2),
       ROUND(6.8 + MOD(CAST(RIGHT(s.student_id, 2) AS UNSIGNED) + 2, 10) * 0.30, 2),
       ROUND(6.65 + MOD(CAST(RIGHT(s.student_id, 2) AS UNSIGNED), 10) * 0.20, 2),
       CASE WHEN MOD(CAST(RIGHT(s.student_id, 2) AS UNSIGNED), 10) >= 8 THEN 'A'
            WHEN MOD(CAST(RIGHT(s.student_id, 2) AS UNSIGNED), 10) >= 5 THEN 'B+'
            WHEN MOD(CAST(RIGHT(s.student_id, 2) AS UNSIGNED), 10) >= 2 THEN 'B' ELSE 'C+' END,
       NOW(), 'STUDENT',
       ROUND(6.8 + MOD(CAST(RIGHT(s.student_id, 2) AS UNSIGNED), 10) * 0.28, 2),
       ROUND(8.0 + MOD(CAST(RIGHT(s.student_id, 2) AS UNSIGNED), 5) * 0.4, 2), 0
FROM seed_students s
UNION ALL
SELECT CONCAT('ENR-O003-', s.student_id), s.student_id, 'O003', '2025-09-01 08:00:00', 'ACTIVE',
       ROUND(5.5 + MOD(CAST(RIGHT(s.student_id, 2) AS UNSIGNED), 10) * 0.25, 2),
       ROUND(5.0 + MOD(CAST(RIGHT(s.student_id, 2) AS UNSIGNED) + 3, 10) * 0.27, 2),
       ROUND(5.4 + MOD(CAST(RIGHT(s.student_id, 2) AS UNSIGNED), 10) * 0.18, 2),
       CASE WHEN MOD(CAST(RIGHT(s.student_id, 2) AS UNSIGNED), 10) >= 8 THEN 'B+'
            WHEN MOD(CAST(RIGHT(s.student_id, 2) AS UNSIGNED), 10) >= 5 THEN 'B'
            WHEN MOD(CAST(RIGHT(s.student_id, 2) AS UNSIGNED), 10) >= 2 THEN 'C+' ELSE 'C' END,
       NOW(), 'STUDENT',
       ROUND(5.2 + MOD(CAST(RIGHT(s.student_id, 2) AS UNSIGNED), 10) * 0.25, 2),
       ROUND(7.0 + MOD(CAST(RIGHT(s.student_id, 2) AS UNSIGNED), 5) * 0.45, 2), 0
FROM seed_students s
ON DUPLICATE KEY UPDATE
    status = VALUES(status),
    midterm_score = VALUES(midterm_score),
    final_score = VALUES(final_score),
    total_score = VALUES(total_score),
    letter_grade = VALUES(letter_grade),
    role = VALUES(role),
    assignment_score = VALUES(assignment_score),
    attendance_score = VALUES(attendance_score);

-- 6. Moi sinh vien nop du 2 bai/lop: 120 bai nop.
INSERT INTO db_course.submissions
    (submission_id, assessment_id, student_id, file_url, submission_text,
     submitted_at, rubric_id, status, submitted_link, grade_core)
SELECT CONCAT('SUB-', a.offering_id, '-', a.short_code, '-', s.student_id),
       a.assessment_id, s.student_id,
       CONCAT('https://example.com/', LOWER(a.offering_id), '/submissions/', s.student_id, '/', LOWER(a.short_code), '.pdf'),
       CONCAT('Bài nộp ', a.assessment_name, ' của sinh viên ', s.student_id),
       a.submitted_at, a.rubric_id, 'GRADED', NULL, a.grade_core
FROM seed_students s
CROSS JOIN (
    SELECT 'O002' AS offering_id, 'A1' AS short_code, 'A-C002-01' AS assessment_id,
           'Bài tập thiết kế cơ sở dữ liệu' AS assessment_name,
           '2025-10-14 20:00:00' AS submitted_at, 'R2' AS rubric_id, 8.0 AS grade_core
    UNION ALL SELECT 'O002', 'A2', 'A-C002-02', 'Đồ án truy vấn và tối ưu SQL',
           '2025-12-14 20:00:00', 'R2', 8.2
    UNION ALL SELECT 'O003', 'A1', 'A-C003-01', 'Bài tập phân tích yêu cầu',
           '2025-10-19 20:00:00', 'R3', 6.8
    UNION ALL SELECT 'O003', 'A2', 'A-C003-02', 'Đồ án thiết kế và kiểm thử phần mềm',
           '2025-12-19 20:00:00', 'R3', 6.2
) a
WHERE 1 = 1
ON DUPLICATE KEY UPDATE
    file_url = VALUES(file_url),
    submission_text = VALUES(submission_text),
    submitted_at = VALUES(submitted_at),
    rubric_id = VALUES(rubric_id),
    status = VALUES(status),
    grade_core = VALUES(grade_core);

-- Grades khong co unique key theo submission, nen chi xoa dung du lieu seed nay.
DELETE FROM db_grading.`Grades`
WHERE submission_id LIKE 'SUB-O002-%' OR submission_id LIKE 'SUB-O003-%';

INSERT INTO db_grading.`Grades`
    (assessment_id, comment, grade, rubric_id, status, student_id, submission_id, total_score)
SELECT sub.assessment_id,
       'Đã chấm theo rubric và phản hồi theo chuẩn đầu ra CLO.',
       CASE WHEN x.score >= 8.5 THEN 'A'
            WHEN x.score >= 7.0 THEN 'B'
            WHEN x.score >= 5.5 THEN 'C' ELSE 'D' END,
       sub.rubric_id, 'GRADED', sub.student_id, sub.submission_id, x.score
FROM db_course.submissions sub
JOIN (
    SELECT submission_id,
           ROUND(CASE
               WHEN assessment_id = 'A-C002-01' THEN 6.5 + MOD(CAST(RIGHT(student_id, 2) AS UNSIGNED), 10) * 0.30
               WHEN assessment_id = 'A-C002-02' THEN 7.0 + MOD(CAST(RIGHT(student_id, 2) AS UNSIGNED) + 2, 10) * 0.28
               WHEN assessment_id = 'A-C003-01' THEN 5.5 + MOD(CAST(RIGHT(student_id, 2) AS UNSIGNED), 10) * 0.32
               ELSE 4.8 + MOD(CAST(RIGHT(student_id, 2) AS UNSIGNED) + 3, 10) * 0.35
           END, 2) AS score
    FROM db_course.submissions
    WHERE assessment_id IN ('A-C002-01', 'A-C002-02', 'A-C003-01', 'A-C003-02')
) x ON x.submission_id = sub.submission_id
WHERE sub.assessment_id IN ('A-C002-01', 'A-C002-02', 'A-C003-01', 'A-C003-02');

-- 7. Ket qua tung tieu chi rubric. Du lieu SE301 co CLO3 thap hon de dashboard OBE co canh bao that.
DROP TEMPORARY TABLE IF EXISTS seed_rubric_scores;
CREATE TEMPORARY TABLE seed_rubric_scores AS
SELECT sub.submission_id, sub.rubric_id, rc.criteria_id,
       CASE
           WHEN rc.criteria_id = 'RC-C002-1' THEN
               CASE MOD(CAST(RIGHT(sub.student_id, 2) AS UNSIGNED), 5)
                   WHEN 0 THEN 5.0 WHEN 1 THEN 7.5 WHEN 2 THEN 7.5 ELSE 10.0 END
           WHEN rc.criteria_id = 'RC-C002-2' THEN
               CASE MOD(CAST(RIGHT(sub.student_id, 2) AS UNSIGNED) + 1, 5)
                   WHEN 0 THEN 5.0 WHEN 1 THEN 7.5 WHEN 2 THEN 7.5 ELSE 10.0 END
           WHEN rc.criteria_id = 'RC-C002-3' THEN
               CASE MOD(CAST(RIGHT(sub.student_id, 2) AS UNSIGNED) + 2, 5)
                   WHEN 0 THEN 5.0 WHEN 1 THEN 5.0 WHEN 2 THEN 7.5 ELSE 10.0 END
           WHEN rc.criteria_id = 'RC-C003-1' THEN
               CASE MOD(CAST(RIGHT(sub.student_id, 2) AS UNSIGNED), 5)
                   WHEN 0 THEN 5.0 WHEN 1 THEN 7.5 WHEN 2 THEN 7.5 ELSE 10.0 END
           WHEN rc.criteria_id = 'RC-C003-2' THEN
               CASE MOD(CAST(RIGHT(sub.student_id, 2) AS UNSIGNED) + 1, 5)
                   WHEN 0 THEN 2.5 WHEN 1 THEN 5.0 WHEN 2 THEN 7.5 ELSE 7.5 END
           ELSE
               CASE MOD(CAST(RIGHT(sub.student_id, 2) AS UNSIGNED) + 2, 5)
                   WHEN 0 THEN 2.5 WHEN 1 THEN 2.5 WHEN 2 THEN 5.0 ELSE 7.5 END
       END AS calculated_score
FROM db_course.submissions sub
JOIN db_rubric_service.rubric_criteria rc ON rc.rubric_id = sub.rubric_id
WHERE sub.assessment_id IN ('A-C002-01', 'A-C002-02', 'A-C003-01', 'A-C003-02')
  AND rc.criteria_id IN (
      'RC-C002-1', 'RC-C002-2', 'RC-C002-3',
      'RC-C003-1', 'RC-C003-2', 'RC-C003-3'
  );

INSERT INTO db_grading.rubric_results
    (result_id, submission_id, criteria_id, level_id, calculated_score,
     lecturer_comment, graded_at)
SELECT CONCAT('RR-', s.submission_id, '-', RIGHT(s.criteria_id, 1)),
       s.submission_id, s.criteria_id,
       CONCAT(s.criteria_id, '-L',
           CASE WHEN s.calculated_score >= 8.75 THEN 4
                WHEN s.calculated_score >= 6.25 THEN 3
                WHEN s.calculated_score >= 3.75 THEN 2 ELSE 1 END),
       s.calculated_score,
       CASE WHEN s.calculated_score >= 7.5
            THEN 'Đáp ứng chuẩn đầu ra; tiếp tục duy trì chất lượng.'
            ELSE 'Cần cải thiện nội dung tương ứng với CLO này.' END,
       '2026-01-05 09:00:00'
FROM seed_rubric_scores s
WHERE 1 = 1
ON DUPLICATE KEY UPDATE
    level_id = VALUES(level_id),
    calculated_score = VALUES(calculated_score),
    lecturer_comment = VALUES(lecturer_comment),
    graded_at = VALUES(graded_at);

DROP TEMPORARY TABLE IF EXISTS seed_rubric_scores;

-- Don dep dung hai rubric ma ban seed cu tung tao (neu da lo chay ban cu).
-- Moi tham chieu do script quan ly da duoc chuyen sang R2/R3 o cac buoc tren.
DELETE FROM db_rubric_service.rubrics WHERE rubric_id IN ('R-C002', 'R-C003');

-- 8. Kiem tra ket qua sau khi seed.
SELECT o.offering_id, c.course_code, c.course_name,
       o.main_lecturer_id,
       COUNT(DISTINCT e.student_id) AS student_count,
       COUNT(DISTINCT a.assessment_id) AS assessment_count,
       COUNT(DISTINCT clo.clo_id) AS clo_count,
       COUNT(DISTINCT sub.submission_id) AS submission_count
FROM db_course.course_offerings o
JOIN db_course.courses c ON c.course_id = o.course_id
LEFT JOIN db_course.enrollments e ON e.offering_id = o.offering_id AND e.role = 'STUDENT'
LEFT JOIN db_course.assessments a ON a.offering_id = o.offering_id
LEFT JOIN db_course.course_clo clo ON clo.course_id = c.course_id
LEFT JOIN db_course.submissions sub ON sub.assessment_id = a.assessment_id
WHERE o.offering_id IN ('O002', 'O003')
GROUP BY o.offering_id, c.course_code, c.course_name, o.main_lecturer_id
ORDER BY o.offering_id;

SELECT a.offering_id,
       COUNT(DISTINCT g.submission_id) AS graded_submission_count,
       COUNT(rr.result_id) AS rubric_result_count,
       ROUND(AVG(rr.calculated_score) / 10 * 100, 2) AS obe_average_percent
FROM db_course.assessments a
JOIN db_course.submissions sub ON sub.assessment_id = a.assessment_id
JOIN db_grading.`Grades` g ON g.submission_id = sub.submission_id AND g.status = 'GRADED'
JOIN db_grading.rubric_results rr ON rr.submission_id = sub.submission_id
WHERE a.offering_id IN ('O002', 'O003')
GROUP BY a.offering_id
ORDER BY a.offering_id;

DROP TEMPORARY TABLE IF EXISTS seed_students;
