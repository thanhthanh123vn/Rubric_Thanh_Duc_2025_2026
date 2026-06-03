package hcmuaf.edu.vn.fit.course_service.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "question_banks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionBank {

    @Id
    private String id;

    private String name;


    private String offeringId;

    private String lecturerId;


    @Builder.Default
    private List<String> questionIds = new ArrayList<>();
}