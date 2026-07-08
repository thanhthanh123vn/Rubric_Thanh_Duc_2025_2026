package hcmuaf.edu.vn.fit.course_service.entity;

import hcmuaf.edu.vn.fit.course_service.entity.enums.Difficulty;
import hcmuaf.edu.vn.fit.course_service.entity.enums.QuestionType;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Question {

    @Id
    private String id;

    private String content;

    private QuestionType type;

    private Difficulty difficulty;

    private String offeringId;
    private String chapterId;
    private Double score;

    @Builder.Default
    private List<AnswerOption> options = new ArrayList<>();


    @Builder.Default
    private List<String> cloIds = new ArrayList<>();
}