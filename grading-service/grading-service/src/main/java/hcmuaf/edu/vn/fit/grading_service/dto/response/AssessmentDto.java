package hcmuaf.edu.vn.fit.grading_service.dto.response;

import lombok.Data;

@Data
public class AssessmentDto {
    private String id;
    private String type; // Ví dụ: "ATTENDANCE", "ASSIGNMENT", "EXAM"
}