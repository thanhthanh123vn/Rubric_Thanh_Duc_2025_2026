package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CLOLecturerResponse {

    private String cloId;
    private String cloCode;
    private String cloDescription;

    private double progressPercent;

    // analytics
    private int totalStudents;
    private int passedStudents;
    private int failedStudents;

    // distribution
    private int below40;
    private int from40to70;
    private int above70;

}
