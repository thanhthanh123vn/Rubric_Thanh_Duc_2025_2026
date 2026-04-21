package hcmuaf.edu.vn.fit.course_service.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import hcmuaf.edu.vn.fit.course_service.dto.response.AssessmentReponse;
import hcmuaf.edu.vn.fit.course_service.repository.AssessmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;


@Service
public class AssessmentService {

    @Autowired
    private AssessmentRepository assessmentRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<AssessmentReponse> getAssByCourseOffering(String courseOffering, String studentId) {

        List<Object[]> res = assessmentRepository
                .getAssignmentByCourseOffering(courseOffering, studentId);

        return res.stream().map(item -> {
            try {
                AssessmentReponse dto = new AssessmentReponse();

                dto.setAssessmentId(item[0] != null ? item[0].toString() : null);
                dto.setAssessmentName(item[1] != null ? item[1].toString() : null);

                dto.setWeight(item[2] != null ? ((Number) item[2]).floatValue() : null);

                dto.setEndTime((Timestamp) item[3]);

                dto.setSubmissionId(item[4] != null ? item[4].toString() : null);
                dto.setSubmissionAt((Timestamp) item[5]);

                dto.setCalculatedScore(item[6] != null ? ((Number) item[6]).floatValue() : null);

                dto.setLecturerComment(item[7] != null ? item[7].toString() : null);

                if (item[8] != null) {
                    String closJson = item[8].toString(); // ["CLO1","CLO2"]
                    List<String> clos = objectMapper.readValue(
                            closJson,
                            new TypeReference<List<String>>() {}
                    );
                    dto.setCloCode(clos);
                }

                return dto;

            } catch (Exception e) {
                throw new RuntimeException("Parse error", e);
            }
        }).toList();
    }
}