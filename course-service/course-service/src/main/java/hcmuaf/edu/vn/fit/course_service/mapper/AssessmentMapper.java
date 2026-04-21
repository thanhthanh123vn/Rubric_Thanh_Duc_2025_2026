package hcmuaf.edu.vn.fit.course_service.mapper;

import hcmuaf.edu.vn.fit.course_service.dto.response.AssessmentReponse;
import hcmuaf.edu.vn.fit.course_service.entity.Assessment;

public class AssessmentMapper {
    public void toAssessmentResponse(Assessment assessment){
        AssessmentReponse assessmentReponse = new AssessmentReponse();
        assessmentReponse.setAssessmentId(assessment.getAssessmentId());

    }
}
