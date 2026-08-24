package hcmuaf.edu.vn.fit.course_service.dto.request;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class TeachingAssistantAssignmentRequest {
    private List<String> assistantLecturerIds = new ArrayList<>();
}
