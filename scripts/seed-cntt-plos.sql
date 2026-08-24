-- Seed 12 PLO cho Chuong trinh dao tao Cong nghe thong tin.
-- Database: db_course (MariaDB 10.4 / MySQL)
-- Script co the chay lai: PLO trung ma trong cung chuong trinh se duoc cap nhat.

USE db_course;

START TRANSACTION;

INSERT INTO program (
    program_id,
    program_code,
    program_name,
    description
)
SELECT
    'PROGRAM-CNTT',
    'CNTT',
    'Chương trình đào tạo Công nghệ thông tin',
    'Chương trình đào tạo của Khoa Công nghệ thông tin'
WHERE NOT EXISTS (
    SELECT 1
    FROM program
    WHERE UPPER(program_code) = 'CNTT'
);

SET @cntt_program_id = (
    SELECT program_id
    FROM program
    WHERE UPPER(program_code) = 'CNTT'
    LIMIT 1
);

INSERT INTO program_plo (
    plo_id,
    program_id,
    plo_code,
    plo_name,
    description
)
VALUES
(
    UUID(),
    @cntt_program_id,
    'PLO1',
    'Kiến thức chung',
    'Vận dụng các kiến thức cơ bản về khoa học tự nhiên, công nghệ thông tin và toán thống kê để tiếp thu học tập các môn cơ sở ngành và tính toán/giải quyết các vấn đề liên quan đến ngành đào tạo.'
),
(
    UUID(),
    @cntt_program_id,
    'PLO2',
    'Kiến thức chung',
    'Vận dụng kiến thức cơ bản về khoa học xã hội – nhân văn, chính trị, pháp luật, ngoại ngữ và kỹ năng mềm để tiếp thu học tập các môn cơ sở ngành và giải quyết các vấn đề liên quan đến ngành đào tạo.'
),
(
    UUID(),
    @cntt_program_id,
    'PLO3',
    'Kiến thức chung',
    'Vận dụng các kiến thức nền tảng của lĩnh vực CNTT (kiến trúc máy tính, hệ điều hành, mạng máy tính, lập trình, cấu trúc dữ liệu và giải thuật, cơ sở dữ liệu) trong các hoạt động chuyên môn.'
),
(
    UUID(),
    @cntt_program_id,
    'PLO4',
    'Kiến thức chung',
    'Vận dụng hiệu quả phương pháp hướng đối tượng và nền tảng lập trình Java trong phát triển hệ thống phần mềm.'
),
(
    UUID(),
    @cntt_program_id,
    'PLO5',
    'Kiến thức chung',
    'Áp dụng linh hoạt các kiến thức chuyên ngành CNTT và công nghệ tiên tiến để giải quyết các vấn đề trong thực tế, đặc biệt trong hệ thống thông tin và công nghệ phần mềm.'
),
(
    UUID(),
    @cntt_program_id,
    'PLO6',
    'Kiến thức nghề nghiệp',
    'Phân tích, hình thành ý tưởng, thiết kế, hiện thực hóa và triển khai các hệ thống CNTT phù hợp với bối cảnh doanh nghiệp và xã hội.'
),
(
    UUID(),
    @cntt_program_id,
    'PLO7',
    'Kiến thức nghề nghiệp',
    'Áp dụng thành thạo các bước trong quy trình phát triển phần mềm đã được thừa nhận.'
),
(
    UUID(),
    @cntt_program_id,
    'PLO8',
    'Kiến thức nghề nghiệp',
    'Sử dụng khả năng tư duy và giải quyết vấn đề trong việc xây dựng và tư vấn giải pháp phần mềm, phát hiện, phân tích và giải quyết các vấn đề trong lĩnh vực CNTT.'
),
(
    UUID(),
    @cntt_program_id,
    'PLO9',
    'Kiến thức nghề nghiệp',
    'Phát triển các hệ thống thông minh thông qua việc ứng dụng trí tuệ nhân tạo (AI) và dữ liệu lớn (big data).'
),
(
    UUID(),
    @cntt_program_id,
    'PLO10',
    'Kỹ năng',
    'Khả năng làm việc độc lập, làm việc nhóm và giao tiếp hiệu quả trong môi trường làm việc trong nước và quốc tế.'
),
(
    UUID(),
    @cntt_program_id,
    'PLO11',
    'Thái độ – Ý thức',
    'Coi trọng các giá trị đạo đức nghề nghiệp và học tập suốt đời.'
),
(
    UUID(),
    @cntt_program_id,
    'PLO12',
    'Thái độ – Hành vi',
    'Vận dụng kiến thức về giáo dục thể chất và giáo dục quốc phòng – an ninh trong việc rèn luyện sức khỏe tinh thần, thể chất, ý thức xây dựng và bảo vệ cộng đồng, địa phương, tổ quốc.'
)
ON DUPLICATE KEY UPDATE
    plo_name = VALUES(plo_name),
    description = VALUES(description);

COMMIT;

-- Kiem tra ket qua.
SELECT
    p.program_code,
    pp.plo_id,
    pp.plo_code,
    pp.plo_name,
    pp.description,
    COUNT(mapping.clo_id) AS linked_clo_count
FROM program_plo pp
JOIN program p
    ON p.program_id = pp.program_id
LEFT JOIN clo_plo_mapping mapping
    ON mapping.plo_id = pp.plo_id
WHERE UPPER(p.program_code) = 'CNTT'
GROUP BY
    p.program_code,
    pp.plo_id,
    pp.plo_code,
    pp.plo_name,
    pp.description
ORDER BY CAST(REPLACE(UPPER(pp.plo_code), 'PLO', '') AS UNSIGNED);
