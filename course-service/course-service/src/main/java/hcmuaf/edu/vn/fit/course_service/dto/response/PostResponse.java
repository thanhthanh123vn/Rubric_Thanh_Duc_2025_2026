package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PostResponse {
    private String id;
    private String offeringId;
    private String authorId;
    private String title;
    private String content;
    private LocalDateTime createdAt;

    private String authorName;
    private List<SyllabusFileDTO> files;
}