package hcmuaf.edu.vn.fit.course_service.mapper;

import hcmuaf.edu.vn.fit.course_service.dto.response.AssessmentDetailResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.AssessmentLecturerResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Assessment;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-26T18:19:21+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 23.0.1 (Oracle Corporation)"
)
@Component
public class AssessmentMapperImpl implements AssessmentMapper {

    @Override
    public AssessmentLecturerResponse toResponse(Assessment assessment) {
        if ( assessment == null ) {
            return null;
        }

        AssessmentLecturerResponse.AssessmentLecturerResponseBuilder assessmentLecturerResponse = AssessmentLecturerResponse.builder();

        assessmentLecturerResponse.offeringId( assessmentCourseOfferingOfferingId( assessment ) );
        assessmentLecturerResponse.assessmentId( assessment.getAssessmentId() );
        assessmentLecturerResponse.assessmentName( assessment.getAssessmentName() );
        assessmentLecturerResponse.description( assessment.getDescription() );
        assessmentLecturerResponse.assessmentType( assessment.getAssessmentType() );
        assessmentLecturerResponse.weight( assessment.getWeight() );
        assessmentLecturerResponse.fileUrl( assessment.getFileUrl() );
        assessmentLecturerResponse.startTime( assessment.getStartTime() );
        assessmentLecturerResponse.endTime( assessment.getEndTime() );

        return assessmentLecturerResponse.build();
    }

    @Override
    public AssessmentDetailResponse toDetailResponse(Assessment assessment) {
        if ( assessment == null ) {
            return null;
        }

        AssessmentDetailResponse assessmentDetailResponse = new AssessmentDetailResponse();

        assessmentDetailResponse.setAssessmentId( assessment.getAssessmentId() );
        assessmentDetailResponse.setDescription( assessment.getDescription() );
        assessmentDetailResponse.setAssessmentName( assessment.getAssessmentName() );
        assessmentDetailResponse.setFileUrl( assessment.getFileUrl() );
        if ( assessment.getWeight() != null ) {
            assessmentDetailResponse.setWeight( assessment.getWeight() );
        }
        assessmentDetailResponse.setEndTime( assessment.getEndTime() );
        assessmentDetailResponse.setRubricId( assessment.getRubricId() );

        return assessmentDetailResponse;
    }

    private String assessmentCourseOfferingOfferingId(Assessment assessment) {
        CourseOffering courseOffering = assessment.getCourseOffering();
        if ( courseOffering == null ) {
            return null;
        }
        return courseOffering.getOfferingId();
    }
}
