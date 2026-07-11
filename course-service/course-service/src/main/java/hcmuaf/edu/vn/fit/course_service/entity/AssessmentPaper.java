package hcmuaf.edu.vn.fit.course_service.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "assessment_papers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentPaper extends AbstractEntity {

    private String lecturerId;

    private String assessmentId;
    private String sourceQuestionBankId;
    private List<String> questionIds;
    private String status;
    private String examTitle;
    private Integer durationMinutes;



    private Instant startTime;
    private Instant endTime;
    @Builder.Default
    private Boolean shuffleQuestions = true;
    @Builder.Default
    private Boolean shuffleOptions = true;

}