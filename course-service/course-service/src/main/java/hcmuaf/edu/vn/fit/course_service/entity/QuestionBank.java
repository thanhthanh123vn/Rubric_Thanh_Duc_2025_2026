package hcmuaf.edu.vn.fit.course_service.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "question_banks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndexes({

        @CompoundIndex(name = "offering_public_idx", def = "{'offeringId': 1, 'isPublic': 1}"),


        @CompoundIndex(name = "lecturer_public_idx", def = "{'lecturerId': 1, 'isPublic': 1}"),


        @CompoundIndex(name = "course_public_idx", def = "{'courseId': 1, 'isPublic': 1}")
})
public class QuestionBank {

    @Id
    private String id;

    private String name;


    private String offeringId;
    private String courseId;
    private String lecturerId;

    @Builder.Default
    private Boolean isPublic = false;

    @Builder.Default
    private List<String> sharePermissions = new ArrayList<>();

    @Builder.Default
    private List<String> questionIds = new ArrayList<>();
}
