package hcmuaf.edu.vn.fit.course_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalTime;

@Data
public class ScheduleRequest {

    @NotBlank(message = "Mã lớp học phần không được để trống")
    private String offeringId;

    private String room;

    private String classType;

    @NotNull(message = "Ngày trong tuần không được để trống")
    private Integer dayOfWeek;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private LocalTime startTime;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    private LocalTime endTime;

    private String colorTheme;
}