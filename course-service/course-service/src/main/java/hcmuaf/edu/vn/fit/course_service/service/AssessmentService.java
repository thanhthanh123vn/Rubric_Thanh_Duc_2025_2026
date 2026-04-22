package hcmuaf.edu.vn.fit.course_service.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import hcmuaf.edu.vn.fit.course_service.dto.response.AssessmentDetailResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.AssessmentReponse;
import hcmuaf.edu.vn.fit.course_service.repository.AssessmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


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
    public AssessmentDetailResponse getAssById(String assessmentId, String studentId) {

        List<Object[]> list = assessmentRepository.getAssignmentDetail(assessmentId, studentId);

        if (list == null || list.isEmpty()) return null;

        Object[] res = list.get(0);
        if (res == null) {
            return null;
        }

        try {
            AssessmentDetailResponse dto = new AssessmentDetailResponse();

            dto.setAssessmentId((String) res[0]);
            dto.setAssessmentName((String) res[1]);
            dto.setDescription((String) res[2]);
            dto.setWeight(res[3] != null ? ((Number) res[3]).doubleValue() : 0);
            dto.setEndTime((Timestamp) res[4]);

            dto.setSubmissionId((String) res[5]);
            dto.setSubmissionAt((Timestamp) res[6]);

            dto.setCalculatedScore(res[7] != null ? ((Number) res[7]).doubleValue() : 0);
            dto.setLecturerComment((String) res[8]);

            String closJson = (String) res[9];
            if (closJson != null) {
                ObjectMapper mapper = new ObjectMapper();
                List<Map<String, String>> cloList =
                        mapper.readValue(closJson, new TypeReference<>() {});

                // convert list -> map (code -> description)
                Map<String, String> closMap = new HashMap<>();
                for (Map<String, String> clo : cloList) {
                    closMap.put(clo.get("code"), clo.get("description"));
                }

                dto.setClos(closMap);
            }

            return dto;

        } catch (Exception e) {
            throw new RuntimeException("Parse error", e);
        }
    }
}