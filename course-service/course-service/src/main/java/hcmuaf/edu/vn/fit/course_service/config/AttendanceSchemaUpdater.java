package hcmuaf.edu.vn.fit.course_service.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AttendanceSchemaUpdater implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            String dataType = jdbcTemplate.queryForObject(
                    """
                    SELECT DATA_TYPE
                    FROM information_schema.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE()
                      AND TABLE_NAME = 'attendance'
                      AND COLUMN_NAME = 'status'
                    """,
                    String.class
            );

            if (dataType != null && "enum".equalsIgnoreCase(dataType)) {
                jdbcTemplate.execute("ALTER TABLE attendance MODIFY COLUMN status VARCHAR(20) NOT NULL");
                log.info("Updated attendance.status column from ENUM to VARCHAR(20).");
            }
        } catch (Exception exception) {
            log.warn("Could not verify or update attendance.status schema: {}", exception.getMessage());
        }
    }
}
