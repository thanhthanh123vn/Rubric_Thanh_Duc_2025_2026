package hcmuaf.edu.vn.fit.rubric_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityResponse {
    private Integer id;
    private String type;
    private String description;
    private String timeAgo;
    private boolean isNew;
}