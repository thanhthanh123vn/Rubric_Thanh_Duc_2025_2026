package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class StudentExamResultResponse {
    private String examTitle;
    private double score;
    private double totalPoints;
    private int totalQuestions;
    private int correctQuestions;
    private List<QuestionResult> details;

    @Data
    public static class QuestionResult {
        private String id;
        private String content;
        private String type;
        private List<OptionDto> options;

        private Object studentAnswer;
        private String correctAnswer;
        private boolean correct;
        private double points;
        private Double maxPoints;
    }

    @Data
    public static class OptionDto {
        private String id;
        private String content;
        private boolean correct;
    }
}