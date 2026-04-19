package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.temporal.ChronoUnit;

@Data
@Builder
public class ScheduleResponse {
    private String id;
    private String title;
    private String room;
    private String type;
    private Integer day;
    private Double startHour;
    private Double duration;
    private String color;     
}