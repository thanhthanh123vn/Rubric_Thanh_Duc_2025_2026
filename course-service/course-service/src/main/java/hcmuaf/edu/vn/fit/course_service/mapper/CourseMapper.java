package hcmuaf.edu.vn.fit.course_service.mapper;


import hcmuaf.edu.vn.fit.course_service.dto.request.CourseRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.CourseOfferingResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.CourseResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Course;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface CourseMapper {

    Course toCourse(CourseRequest request);
    CourseResponse toCourseResponse(Course course);
    void updateCourseFromRequest(CourseRequest request, @MappingTarget Course course);


    @Mapping(target = "lecturerName", ignore = true)
    CourseOfferingResponse toOfferingResponse(CourseOffering offering);


    CourseOfferingResponse toResponse(CourseOffering offering);
}