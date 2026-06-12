package hcmuaf.edu.vn.fit.course_service.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class QuestionBankRequest {
    private String name;
    private String offeringId;
    private Boolean isPublic;
    private List<String> sharePermissions;
}
