package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.io.InputStream;

@Data
@Builder
public class ExportFile {
    private String filename;
    private String contentType;
    private InputStream inputStream;
}