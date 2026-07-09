package hcmuaf.edu.vn.fit.course_service.repository.mongo;

import hcmuaf.edu.vn.fit.course_service.entity.StudentExamAssignment;
import hcmuaf.edu.vn.fit.course_service.entity.enums.StudentExamStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface StudentExamAssignmentRepository extends MongoRepository<StudentExamAssignment, String> {

    List<StudentExamAssignment> findByAssessmentPaperId(String assessmentPaperId);

    List<StudentExamAssignment> findByStudentId(String studentId);

    boolean existsByAssessmentPaperIdAndStudentId(String assessmentPaperId, String studentId);

    List<StudentExamAssignment> findByStatus(StudentExamStatus status);


}