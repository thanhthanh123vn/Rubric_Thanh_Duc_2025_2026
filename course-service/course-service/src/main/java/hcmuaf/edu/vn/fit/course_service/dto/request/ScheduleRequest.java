package hcmuaf.edu.vn.fit.course_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleRequest {

    private String offeringId;

    private String room;
    private String type;
    private Integer day;


    private LocalTime startTime;
    private LocalTime endTime;

    private String color;
}