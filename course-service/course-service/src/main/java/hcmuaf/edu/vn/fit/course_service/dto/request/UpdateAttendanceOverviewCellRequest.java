package hcmuaf.edu.vn.fit.course_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAttendanceOverviewCellRequest {
    private String studentId;
    private String sessionId;
    private String status;
    private String note;
    private String category;
    private String colorHex;
    private String legendLabel;
}
