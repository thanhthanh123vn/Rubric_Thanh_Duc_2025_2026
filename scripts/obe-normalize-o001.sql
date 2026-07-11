SET NAMES utf8mb4 COLLATE utf8mb4_unicode_520_ci;

START TRANSACTION;

-- =========================================================
-- Chuan hoa du lieu OBE cho hoc phan O001 / mon C001
-- Muc tieu:
-- 1. Gan CLO dung vao mon hoc
-- 2. Loai bo mapping assessment_clo sai / vo nghia
-- 3. Tao lai mapping assessment -> CLO theo du lieu rubric/submission hien co
-- 4. Dong bo rubric_id cho assessment neu submissions da xac dinh ro rubric
-- =========================================================

-- ---------------------------------------------------------
-- 0. Cau hinh muc tieu
-- ---------------------------------------------------------
SET @offering_id = 'O001';
SET @course_id = 'C001';

-- ---------------------------------------------------------
-- 1. Dam bao CLO1 thuoc mon C001 va co trong course_clo_map
-- ---------------------------------------------------------
UPDATE course_clo
SET course_id = @course_id
WHERE clo_id = 'CLO1';

INSERT INTO course_clo_map (course_id, clo_id)
SELECT @course_id, 'CLO1'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM course_clo_map
    WHERE course_id = @course_id
      AND clo_id = 'CLO1'
);

-- ---------------------------------------------------------
-- 2. Gan course_id cho cac CLO dang ton tai nhung bi NULL
--    Neu muon giu lai de dung cho cac man khac thi nen gan ve C001
-- ---------------------------------------------------------
UPDATE course_clo
SET course_id = @course_id
WHERE clo_id IN (
    '5d1b8375-b60a-4fdb-8569-5a790fd6188d',
    '5dde1db3-a7ff-4c73-9cdf-c75f477798c5',
    '72f408ae-d368-4e64-adce-c3574c288242',
    '75466f1d-44cb-491f-bdb4-b803a7b6db34',
    'd3bc40af-22d0-43b6-a065-9e4a3216e5e6'
)
AND course_id IS NULL;

INSERT INTO course_clo_map (course_id, clo_id)
SELECT @course_id, c.clo_id
FROM course_clo c
WHERE c.clo_id IN (
    '5d1b8375-b60a-4fdb-8569-5a790fd6188d',
    '5dde1db3-a7ff-4c73-9cdf-c75f477798c5',
    '72f408ae-d368-4e64-adce-c3574c288242',
    '75466f1d-44cb-491f-bdb4-b803a7b6db34',
    'd3bc40af-22d0-43b6-a065-9e4a3216e5e6'
)
AND NOT EXISTS (
    SELECT 1
    FROM course_clo_map m
    WHERE m.course_id = @course_id
      AND m.clo_id = c.clo_id
);

-- ---------------------------------------------------------
-- 3. Dong bo rubric_id cho assessment dua theo submissions
--    Chi cap nhat khi 1 assessment dang co duy nhat 1 rubric_id ro rang
-- ---------------------------------------------------------
UPDATE assessments a
JOIN (
    SELECT
        s.assessment_id,
        MIN(s.rubric_id) AS rubric_id
    FROM submissions s
    WHERE s.rubric_id IS NOT NULL
      AND TRIM(s.rubric_id) <> ''
    GROUP BY s.assessment_id
    HAVING COUNT(DISTINCT s.rubric_id) = 1
) x
    ON x.assessment_id = a.assessment_id
SET a.rubric_id = x.rubric_id
WHERE a.offering_id = @offering_id
  AND (a.rubric_id IS NULL OR TRIM(a.rubric_id) = '');

-- ---------------------------------------------------------
-- 4. Xoa mapping assessment_clo sai cua O001 de build lai
--    Chi xoa trong hoc phan O001, khong dong vao offering khac
-- ---------------------------------------------------------
DELETE ac
FROM assessment_clo ac
JOIN assessments a
    ON a.assessment_id = ac.assessment_id
WHERE a.offering_id = @offering_id;

-- ---------------------------------------------------------
-- 5. Tao lai assessment_clo theo rubric criteria thuc te
--    Backend OBE hien tai can:
--    - assessment_clo.clo_id trung voi rubric_criteria.clo_id
--    - course_clo.course_id phai thuoc C001
--
--    Quy tac:
--    - Moi assessment se duoc map vao cac CLO co mat trong rubric dang dung
--    - clo_weight chia deu theo so CLO cua assessment
--      (voi DB hien tai, rubric R3 dang chi map CLO1 nen se ra 100)
-- ---------------------------------------------------------
INSERT INTO assessment_clo (assessment_id, clo_id, clo_weight, assessment_clo_id)
SELECT
    t.assessment_id,
    t.clo_id,
    ROUND(t.assessment_weight / t.clo_count, 2) AS clo_weight,
    CONCAT('AUTO-', t.assessment_id, '-', t.clo_id) AS assessment_clo_id
FROM (
    SELECT
        y.assessment_id,
        y.clo_id,
        y.assessment_weight,
        COUNT(*) OVER (PARTITION BY y.assessment_id) AS clo_count
    FROM (
        SELECT DISTINCT
            a.assessment_id,
            CASE
                WHEN COALESCE(a.weight, 0) > 0 THEN a.weight
                ELSE 100
            END AS assessment_weight,
            rc.clo_id
        FROM assessments a
        JOIN (
            SELECT
                s.assessment_id,
                MIN(s.rubric_id) AS rubric_id
            FROM submissions s
            WHERE s.rubric_id IS NOT NULL
              AND TRIM(s.rubric_id) <> ''
            GROUP BY s.assessment_id
            HAVING COUNT(DISTINCT s.rubric_id) = 1
        ) sr
            ON sr.assessment_id = a.assessment_id
        JOIN rubric_criteria rc
            ON rc.rubric_id = COALESCE(a.rubric_id, sr.rubric_id)
        JOIN course_clo c
            ON c.clo_id = rc.clo_id
           AND c.course_id = @course_id
        WHERE a.offering_id = @offering_id

        UNION

        SELECT DISTINCT
            a.assessment_id,
            CASE
                WHEN COALESCE(a.weight, 0) > 0 THEN a.weight
                ELSE 100
            END AS assessment_weight,
            rc.clo_id
        FROM assessments a
        JOIN rubric_criteria rc
            ON rc.rubric_id = a.rubric_id
        JOIN course_clo c
            ON c.clo_id = rc.clo_id
           AND c.course_id = @course_id
        WHERE a.offering_id = @offering_id
          AND a.rubric_id IS NOT NULL
          AND TRIM(a.rubric_id) <> ''
    ) y
) t;

-- ---------------------------------------------------------
-- 6. Fallback cho assessment chua co rubric/submission ro rang:
--    map vao CLO1 neu assessment co weight > 0 va chua duoc map
--    Muc dich: FE/BE van thay CLO de hien thi, khong bi trang
-- ---------------------------------------------------------
INSERT INTO assessment_clo (assessment_id, clo_id, clo_weight, assessment_clo_id)
SELECT
    a.assessment_id,
    'CLO1' AS clo_id,
    CASE
        WHEN COALESCE(a.weight, 0) > 0 THEN a.weight
        ELSE 100
    END AS clo_weight,
    CONCAT('FALLBACK-', a.assessment_id, '-CLO1') AS assessment_clo_id
FROM assessments a
WHERE a.offering_id = @offering_id
  AND COALESCE(a.weight, 0) > 0
  AND NOT EXISTS (
      SELECT 1
      FROM assessment_clo ac
      WHERE ac.assessment_id = a.assessment_id
  );

-- ---------------------------------------------------------
-- 7. Kiem tra nhanh sau khi chuan hoa
-- ---------------------------------------------------------
SELECT
    a.assessment_id,
    a.assessment_name,
    a.assessment_type,
    a.weight AS assessment_weight,
    a.rubric_id,
    ac.clo_id,
    c.clo_code,
    ac.clo_weight
FROM assessments a
LEFT JOIN assessment_clo ac
    ON ac.assessment_id = a.assessment_id
LEFT JOIN course_clo c
    ON c.clo_id = ac.clo_id
WHERE a.offering_id = @offering_id
ORDER BY a.assessment_name, ac.clo_id;

SELECT
    c.clo_id,
    c.clo_code,
    c.course_id
FROM course_clo c
WHERE c.course_id = @course_id
ORDER BY c.clo_code;

COMMIT;
