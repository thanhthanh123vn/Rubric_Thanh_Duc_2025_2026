package hcmuaf.edu.vn.fit.course_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionRequest {

    private String content;

    private String type;

    private String difficulty;
    private Double score;
    private List<OptionRequest> options;

    private List<String> cloIds;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionRequest {
        private String content;
        private boolean isCorrect;
    }
}