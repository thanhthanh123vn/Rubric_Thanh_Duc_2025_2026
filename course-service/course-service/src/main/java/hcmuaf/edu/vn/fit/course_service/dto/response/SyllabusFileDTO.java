package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;



@Data
@Builder
public class SyllabusFileDTO {
    private String id;
    private String fileName;
    private String fileUrl;
    private String courseId;
    private String uploadedAt;
}