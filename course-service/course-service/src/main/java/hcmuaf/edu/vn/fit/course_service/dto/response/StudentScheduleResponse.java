package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalTime;

@Data
@Builder
public class StudentScheduleResponse {
    private String scheduleId;
    private String offeringId;
    private String offeringName;
    private String courseName;
    private String room;
    private String classType;
    private Integer dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String colorTheme;
}