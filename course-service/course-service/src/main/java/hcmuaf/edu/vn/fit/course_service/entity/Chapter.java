package hcmuaf.edu.vn.fit.course_service.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "chapters")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Chapter {

    @Id
    private String id;


    private String offeringId;


    private String code;


    private String title;


    private Integer order;


    private String description;


    @Builder.Default
    private Boolean active = true;
}