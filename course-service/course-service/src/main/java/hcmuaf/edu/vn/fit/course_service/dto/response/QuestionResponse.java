package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
public class QuestionResponse {
    private String id;
    private String content;
    private String type;
    private String difficulty;
//    private List<CLOLecturerResponse> clos;
    private List<String> cloIds ;

}