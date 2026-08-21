-- Cau truc Program -> ProgramPLO -> CLO-PLO Mapping.
-- Chay sau migrate-course-clo-owner.sql.

CREATE TABLE IF NOT EXISTS program (
    program_id VARCHAR(50) NOT NULL,
    program_code VARCHAR(30) NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    PRIMARY KEY (program_id),
    UNIQUE KEY uk_program_code (program_code)
);

CREATE TABLE IF NOT EXISTS program_plo (
    plo_id VARCHAR(50) NOT NULL,
    program_id VARCHAR(50) NOT NULL,
    plo_code VARCHAR(20) NOT NULL,
    plo_name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    PRIMARY KEY (plo_id),
    UNIQUE KEY uk_program_plo_code (program_id, plo_code),
    CONSTRAINT fk_program_plo_program
        FOREIGN KEY (program_id) REFERENCES program(program_id)
);

CREATE TABLE IF NOT EXISTS clo_plo_mapping (
    clo_id VARCHAR(50) NOT NULL,
    plo_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (clo_id, plo_id),
    CONSTRAINT fk_clo_plo_clo
        FOREIGN KEY (clo_id) REFERENCES course_clo(clo_id),
    CONSTRAINT fk_clo_plo_plo
        FOREIGN KEY (plo_id) REFERENCES program_plo(plo_id)
);

-- assessment_clo.clo_id va rubric_criteria.clo_id tiep tuc tham chieu course_clo.clo_id.
