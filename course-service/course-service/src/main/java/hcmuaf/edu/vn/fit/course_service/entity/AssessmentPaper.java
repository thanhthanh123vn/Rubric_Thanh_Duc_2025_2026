package hcmuaf.edu.vn.fit.course_service.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "assessment_papers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentPaper {
    @Id
    private String id;


    private String assessmentId;


    private String sourceQuestionBankId;


    private List<String> questionIds;


    @Builder.Default
    private Boolean shuffleQuestions = true;
    @Builder.Default
    private Boolean shuffleOptions = true;
}