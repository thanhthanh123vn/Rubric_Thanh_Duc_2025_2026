package hcmuaf.edu.vn.fit.grading_service.service;
import hcmuaf.edu.vn.fit.grading_service.RubricClient;
import hcmuaf.edu.vn.fit.grading_service.entity.Grade;
import hcmuaf.edu.vn.fit.grading_service.repository.GradeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class GradingService {

    @Autowired
    private GradeRepository repository;

    @Autowired
    private RubricClient rubricClient;

    public Grade gradeStudent(Long studentId, Long rubricId) {

        // gọi rubric-service
        Map<String, Object> rubric = rubricClient.getRubric(rubricId);


        double totalScore = Math.random() * 10;

        Grade grade = new Grade();
        grade.setStudentId(studentId);
        grade.setRubricId(rubricId);
        grade.setTotalScore(totalScore);

        return repository.save(grade);
    }
}