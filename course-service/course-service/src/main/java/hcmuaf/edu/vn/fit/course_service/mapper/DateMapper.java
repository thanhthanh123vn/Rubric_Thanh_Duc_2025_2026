package hcmuaf.edu.vn.fit.course_service.mapper;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Component
public class DateMapper {

    public LocalDateTime toLocalDateTime(Instant instant) {
        return instant == null ? null :
                LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
    }
}