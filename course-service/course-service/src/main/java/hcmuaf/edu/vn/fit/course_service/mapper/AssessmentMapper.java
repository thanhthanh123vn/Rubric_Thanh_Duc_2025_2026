package hcmuaf.edu.vn.fit.course_service.mapper;

import hcmuaf.edu.vn.fit.course_service.dto.response.AssessmentLecturerResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.AssessmentResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Assessment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AssessmentMapper {


    @Mapping(source = "courseOffering.offeringId", target = "offeringId")
    AssessmentLecturerResponse toResponse(Assessment assessment);

}