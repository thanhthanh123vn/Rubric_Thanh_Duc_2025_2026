package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class QuestionBankResponse {
    private String id;
    private String name;
    private String offeringId;
    private String lecturerId;
    private Boolean isPublic;
    private String courseName;
    private List<String> sharePermissions;
}
