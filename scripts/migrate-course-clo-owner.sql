-- Chuyen quan he CLO - khoa hoc tu N-N ve Course 1-N CourseCLO.
-- Chay script nay mot lan truoc khi khoi dong rubric-service phien ban moi.

ALTER TABLE course_clo
    ADD COLUMN IF NOT EXISTS course_id VARCHAR(50) NULL AFTER clo_id;

-- Du lieu cu co nhieu mapping cho mot CLO can duoc nghiep vu xac nhan truoc khi chuyen.
SELECT clo_id, COUNT(DISTINCT course_id) AS course_count
FROM course_clo_map
GROUP BY clo_id
HAVING COUNT(DISTINCT course_id) > 1;

-- Gan course_id tu mapping cu. MIN chi co tac dung xac dinh neu du lieu cu bi trung lap;
-- can xem ket qua truy van phia tren truoc khi chay phan con lai.
UPDATE course_clo clo
JOIN (
    SELECT clo_id, MIN(course_id) AS course_id
    FROM course_clo_map
    GROUP BY clo_id
) legacy_mapping ON legacy_mapping.clo_id = clo.clo_id
SET clo.course_id = legacy_mapping.course_id
WHERE clo.course_id IS NULL OR clo.course_id = '';

-- Dong nay se that bai neu van con CLO khong xac dinh duoc khoa hoc, dung theo rang buoc moi.
ALTER TABLE course_clo
    MODIFY COLUMN course_id VARCHAR(50) NOT NULL;

ALTER TABLE course_clo
    ADD CONSTRAINT fk_course_clo_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id);

-- Bo unique cu tren rieng clo_code de cac khoa hoc khac nhau deu co the co CLO1, CLO2...
SET @legacy_clo_code_index = (
    SELECT index_name
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'course_clo'
      AND non_unique = 0
    GROUP BY index_name
    HAVING COUNT(*) = 1 AND MAX(column_name) = 'clo_code'
    LIMIT 1
);
SET @drop_legacy_unique = IF(
    @legacy_clo_code_index IS NULL,
    'SELECT 1',
    CONCAT('ALTER TABLE course_clo DROP INDEX `', @legacy_clo_code_index, '`')
);
PREPARE drop_legacy_unique_statement FROM @drop_legacy_unique;
EXECUTE drop_legacy_unique_statement;
DEALLOCATE PREPARE drop_legacy_unique_statement;

ALTER TABLE course_clo
    ADD CONSTRAINT uk_course_clo_course_code UNIQUE (course_id, clo_code);

-- Chi xoa bang mapping sau khi da kiem tra course_clo.course_id day du.
DROP TABLE course_clo_map;
