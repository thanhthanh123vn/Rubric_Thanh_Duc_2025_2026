package hcmuaf.edu.vn.fit.course_service.mapper;

import hcmuaf.edu.vn.fit.course_service.dto.request.CourseRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.CourseOfferingResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.CourseResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Course;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-22T21:31:38+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 23.0.1 (Oracle Corporation)"
)
@Component
public class CourseMapperImpl implements CourseMapper {

    @Override
    public Course toCourse(CourseRequest request) {
        if ( request == null ) {
            return null;
        }

        Course.CourseBuilder course = Course.builder();

        course.courseCode( request.getCourseCode() );
        course.courseName( request.getCourseName() );
        course.credits( request.getCredits() );
        course.description( request.getDescription() );
        course.department( request.getDepartment() );

        return course.build();
    }

    @Override
    public CourseResponse toCourseResponse(Course course) {
        if ( course == null ) {
            return null;
        }

        CourseResponse courseResponse = new CourseResponse();

        courseResponse.setCourseId( course.getCourseId() );
        courseResponse.setCourseCode( course.getCourseCode() );
        courseResponse.setCourseName( course.getCourseName() );
        courseResponse.setCredits( course.getCredits() );
        courseResponse.setDescription( course.getDescription() );
        courseResponse.setDepartment( course.getDepartment() );

        return courseResponse;
    }

    @Override
    public void updateCourseFromRequest(CourseRequest request, Course course) {
        if ( request == null ) {
            return;
        }

        course.setCourseCode( request.getCourseCode() );
        course.setCourseName( request.getCourseName() );
        course.setCredits( request.getCredits() );
        course.setDescription( request.getDescription() );
        course.setDepartment( request.getDepartment() );
    }

    @Override
    public CourseOfferingResponse toOfferingResponse(CourseOffering offering) {
        if ( offering == null ) {
            return null;
        }

        CourseOfferingResponse.CourseOfferingResponseBuilder courseOfferingResponse = CourseOfferingResponse.builder();

        courseOfferingResponse.offeringId( offering.getOfferingId() );
        courseOfferingResponse.course( toCourseResponse( offering.getCourse() ) );
        courseOfferingResponse.lecturerId( offering.getLecturerId() );
        courseOfferingResponse.semester( offering.getSemester() );

        return courseOfferingResponse.build();
    }

    @Override
    public CourseOfferingResponse toResponse(CourseOffering offering) {
        if ( offering == null ) {
            return null;
        }

        CourseOfferingResponse.CourseOfferingResponseBuilder courseOfferingResponse = CourseOfferingResponse.builder();

        courseOfferingResponse.offeringId( offering.getOfferingId() );
        courseOfferingResponse.course( toCourseResponse( offering.getCourse() ) );
        courseOfferingResponse.lecturerId( offering.getLecturerId() );
        courseOfferingResponse.semester( offering.getSemester() );

        return courseOfferingResponse.build();
    }
}
