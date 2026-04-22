package hcmuaf.edu.vn.fit.course_service.mapper;

import hcmuaf.edu.vn.fit.course_service.dto.request.ScheduleRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.ScheduleResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Course;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.CourseSchedule;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-22T11:57:41+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 23.0.1 (Oracle Corporation)"
)
@Component
public class CourseScheduleMapperImpl implements CourseScheduleMapper {

    @Override
    public ScheduleResponse toDto(CourseSchedule entity) {
        if ( entity == null ) {
            return null;
        }

        ScheduleResponse.ScheduleResponseBuilder scheduleResponse = ScheduleResponse.builder();

        scheduleResponse.id( entity.getScheduleId() );
        scheduleResponse.title( entityCourseOfferingCourseCourseCode( entity ) );
        scheduleResponse.day( entity.getDayOfWeek() );
        scheduleResponse.type( entity.getClassType() );
        scheduleResponse.color( entity.getColorTheme() );
        scheduleResponse.startHour( calculateStartHour( entity.getStartTime() ) );
        scheduleResponse.room( entity.getRoom() );

        scheduleResponse.duration( calculateDuration(entity.getStartTime(), entity.getEndTime()) );

        return scheduleResponse.build();
    }

    @Override
    public List<ScheduleResponse> toDtoList(List<CourseSchedule> entities) {
        if ( entities == null ) {
            return null;
        }

        List<ScheduleResponse> list = new ArrayList<ScheduleResponse>( entities.size() );
        for ( CourseSchedule courseSchedule : entities ) {
            list.add( toDto( courseSchedule ) );
        }

        return list;
    }

    @Override
    public CourseSchedule toEntity(ScheduleRequest request) {
        if ( request == null ) {
            return null;
        }

        CourseSchedule.CourseScheduleBuilder courseSchedule = CourseSchedule.builder();

        courseSchedule.classType( request.getType() );
        courseSchedule.dayOfWeek( request.getDay() );
        courseSchedule.colorTheme( request.getColor() );
        courseSchedule.room( request.getRoom() );
        courseSchedule.startTime( request.getStartTime() );
        courseSchedule.endTime( request.getEndTime() );

        return courseSchedule.build();
    }

    @Override
    public void updateEntityFromDto(ScheduleRequest request, CourseSchedule entity) {
        if ( request == null ) {
            return;
        }

        entity.setClassType( request.getType() );
        entity.setDayOfWeek( request.getDay() );
        entity.setColorTheme( request.getColor() );
        entity.setRoom( request.getRoom() );
        entity.setStartTime( request.getStartTime() );
        entity.setEndTime( request.getEndTime() );
    }

    private String entityCourseOfferingCourseCourseCode(CourseSchedule courseSchedule) {
        CourseOffering courseOffering = courseSchedule.getCourseOffering();
        if ( courseOffering == null ) {
            return null;
        }
        Course course = courseOffering.getCourse();
        if ( course == null ) {
            return null;
        }
        return course.getCourseCode();
    }
}
