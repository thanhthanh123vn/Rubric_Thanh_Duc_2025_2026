package hcmuaf.edu.vn.fit.course_service.repository.mongo;

import hcmuaf.edu.vn.fit.course_service.entity.AssessmentPaper;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository

public interface AssessmentPaperRepository extends MongoRepository<AssessmentPaper, String> {
    Optional<AssessmentPaper> findByAssessmentId(String assessmentId);

    List<AssessmentPaper> findByLecturerId(String lecturerId);


    List<AssessmentPaper> findByIdInAndSourceQuestionBankId(List<String> ids, String sourceQuestionBankId);
}