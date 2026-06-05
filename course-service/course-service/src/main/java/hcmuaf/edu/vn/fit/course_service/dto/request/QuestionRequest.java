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

    private String type; // MULTIPLE_CHOICE, ESSAY

    private String difficulty; // EASY, MEDIUM, HARD

    private List<OptionRequest> options; // Danh sách các đáp án

    private List<String> cloIds; // Danh sách ID của các chuẩn đầu ra (CLOs) được map với câu hỏi này

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionRequest {
        private String content;
        private boolean isCorrect;
    }
}