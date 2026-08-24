-- Non-destructive migration from the legacy shared schema (db_rubric)
-- to five service-owned schemas. Run once as a MariaDB root user.

CREATE DATABASE IF NOT EXISTS db_user CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_course CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_rubric_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_grading CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_notification CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE db_user;

DROP PROCEDURE IF EXISTS copy_legacy_table;
DELIMITER //
CREATE PROCEDURE copy_legacy_table(IN target_schema VARCHAR(64), IN source_table VARCHAR(64))
BEGIN
    DECLARE source_exists INT DEFAULT 0;
    DECLARE target_rows BIGINT DEFAULT 0;
    DECLARE actual_source_table VARCHAR(64);

    SELECT COUNT(*), MAX(table_name) INTO source_exists, actual_source_table
    FROM information_schema.tables
    WHERE table_schema = 'db_rubric'
      AND table_name = source_table
      AND table_type = 'BASE TABLE';

    IF source_exists > 0 THEN
        SET @create_sql = CONCAT(
            'CREATE TABLE IF NOT EXISTS `', target_schema, '`.`', source_table,
            '` LIKE `db_rubric`.`', actual_source_table, '`'
        );
        PREPARE create_statement FROM @create_sql;
        EXECUTE create_statement;
        DEALLOCATE PREPARE create_statement;

        SET @count_sql = CONCAT(
            'SELECT COUNT(*) INTO @destination_rows FROM `', target_schema,
            '`.`', source_table, '`'
        );
        PREPARE count_statement FROM @count_sql;
        EXECUTE count_statement;
        DEALLOCATE PREPARE count_statement;
        SET target_rows = @destination_rows;

        IF target_rows = 0 THEN
            SET @copy_sql = CONCAT(
                'INSERT INTO `', target_schema, '`.`', source_table,
                '` SELECT * FROM `db_rubric`.`', actual_source_table, '`'
            );
            PREPARE copy_statement FROM @copy_sql;
            EXECUTE copy_statement;
            DEALLOCATE PREPARE copy_statement;
        END IF;
    END IF;
END//
DELIMITER ;

-- user-service
CALL copy_legacy_table('db_user', 'Users');
CALL copy_legacy_table('db_user', 'faculty');
CALL copy_legacy_table('db_user', 'department');
CALL copy_legacy_table('db_user', 'sinh_vien');
CALL copy_legacy_table('db_user', 'students');
CALL copy_legacy_table('db_user', 'lecturers');
CALL copy_legacy_table('db_user', 'head_of_department');
CALL copy_legacy_table('db_user', 'tokens');
CALL copy_legacy_table('db_user', 'reset_tokens');
CALL copy_legacy_table('db_user', 'login_history');

-- course-service (relational data)
CALL copy_legacy_table('db_course', 'courses');
CALL copy_legacy_table('db_course', 'course');
CALL copy_legacy_table('db_course', 'course_clo');
CALL copy_legacy_table('db_course', 'course_clo_map');
CALL copy_legacy_table('db_course', 'course_offerings');
CALL copy_legacy_table('db_course', 'course_offering_lecturers');
CALL copy_legacy_table('db_course', 'enrollments');
CALL copy_legacy_table('db_course', 'assessments');
CALL copy_legacy_table('db_course', 'assessment_clo');
CALL copy_legacy_table('db_course', 'submissions');
CALL copy_legacy_table('db_course', 'submission_attachments');
CALL copy_legacy_table('db_course', 'assessment_comments');
CALL copy_legacy_table('db_course', 'attendance_session');
CALL copy_legacy_table('db_course', 'attendance');
CALL copy_legacy_table('db_course', 'attendance_legends');
CALL copy_legacy_table('db_course', 'course_schedules');
CALL copy_legacy_table('db_course', 'groups');
CALL copy_legacy_table('db_course', 'group_tasks');
CALL copy_legacy_table('db_course', 'participants');
CALL copy_legacy_table('db_course', 'conversations');
CALL copy_legacy_table('db_course', 'comments');
CALL copy_legacy_table('db_course', 'messages');
CALL copy_legacy_table('db_course', 'syllabus_files');
CALL copy_legacy_table('db_course', 'posts');
CALL copy_legacy_table('db_course', 'program');
CALL copy_legacy_table('db_course', 'program_plo');
CALL copy_legacy_table('db_course', 'clo_plo_mapping');
CALL copy_legacy_table('db_course', 'clo_plo_map');

-- rubric-service. course_clo remains owned by course-service.
CALL copy_legacy_table('db_rubric_service', 'rubrics');
CALL copy_legacy_table('db_rubric_service', 'rubric_criteria');
CALL copy_legacy_table('db_rubric_service', 'rubric_levels');
CALL copy_legacy_table('db_rubric_service', 'rubric_approval_requests');
CALL copy_legacy_table('db_rubric_service', 'rubric_version_heads');

-- grading-service
CALL copy_legacy_table('db_grading', 'Grades');
CALL copy_legacy_table('db_grading', 'rubric_results');
CALL copy_legacy_table('db_grading', 'feedback_templates');

-- notification-service (notification documents are migrated separately in MongoDB)
CALL copy_legacy_table('db_notification', 'system_settings');
CALL copy_legacy_table('db_notification', 'notifications');

DROP PROCEDURE copy_legacy_table;

SELECT table_schema, COUNT(*) AS table_count
FROM information_schema.tables
WHERE table_schema IN ('db_user', 'db_course', 'db_rubric_service', 'db_grading', 'db_notification')
  AND table_type = 'BASE TABLE'
GROUP BY table_schema
ORDER BY table_schema;
