package hcmuaf.edu.vn.fit.course_service.dto.request;

import lombok.Data;

import java.util.LinkedHashMap;
import java.util.Set;

@Data
public class CloPloMappingRequest {
    private LinkedHashMap<String, Set<String>> mappings = new LinkedHashMap<>();
}
