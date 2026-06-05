package hcmuaf.edu.vn.fit.course_service.mapper;

import hcmuaf.edu.vn.fit.course_service.dto.request.ScheduleRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.ScheduleResponse;
import hcmuaf.edu.vn.fit.course_service.entity.CourseSchedule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Mapper(componentModel = "spring")
public interface CourseScheduleMapper {


    @Mapping(target = "id", source = "scheduleId")
    @Mapping(target = "title", source = "courseOffering.course.courseCode")
    @Mapping(target = "day", source = "dayOfWeek")
    @Mapping(target = "type", source = "classType")
    @Mapping(target = "color", source = "colorTheme")
    @Mapping(target = "startHour", source = "startTime", qualifiedByName = "calculateStartHour")
    @Mapping(target = "duration", expression = "java(calculateDuration(entity.getStartTime(), entity.getEndTime()))")
    ScheduleResponse toDto(CourseSchedule entity);

    List<ScheduleResponse> toDtoList(List<CourseSchedule> entities);


    // Map cho trường hợp Create
    @Mapping(target = "scheduleId", ignore = true)
    @Mapping(target = "courseOffering", ignore = true)
    @Mapping(target = "classType", source = "type")
    @Mapping(target = "dayOfWeek", source = "day")
    @Mapping(target = "colorTheme", source = "color")
    CourseSchedule toEntity(ScheduleRequest request);

    // Map cho trường hợp Update
    @Mapping(target = "scheduleId", ignore = true)
    @Mapping(target = "courseOffering", ignore = true)
    @Mapping(target = "classType", source = "type")
    @Mapping(target = "dayOfWeek", source = "day")
    @Mapping(target = "colorTheme", source = "color")
    void updateEntityFromDto(ScheduleRequest request, @MappingTarget CourseSchedule entity);

    @Named("calculateStartHour")
    default Double calculateStartHour(LocalTime startTime) {
        if (startTime == null) return 0.0;
        // Ví dụ 08:30 -> 8 + 30/60 = 8.5
        return startTime.getHour() + (startTime.getMinute() / 60.0);
    }

    default Double calculateDuration(LocalTime startTime, LocalTime endTime) {
        if (startTime == null || endTime == null) return 0.0;
        // Tính số phút chênh lệch sau đó chia 60 để ra số giờ
        long minutesBetween = ChronoUnit.MINUTES.between(startTime, endTime);
        return minutesBetween / 60.0;
    }
}