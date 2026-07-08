package hcmuaf.edu.vn.fit.course_service.dto.response;

import hcmuaf.edu.vn.fit.course_service.entity.enums.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExamQuestionDetailResponse {
    private String questionId;
    private String content;
    private Difficulty difficulty;
    private Double score;
}