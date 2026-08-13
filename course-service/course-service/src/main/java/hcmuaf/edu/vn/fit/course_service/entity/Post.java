package hcmuaf.edu.vn.fit.course_service.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@CompoundIndex(name = "offering_created_idx", def = "{'offeringId': 1, 'createdAt': -1}")
public class Post {

    @Id
    private String id;


    @Field("offering_id")
    private String offeringId;


    @Field("author_id")
    private String authorId;


    @Field("content")
    private String content;

    @Field("title")
    private String title;

    @Field("file_ids")
    private List<String> fileIds;
    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;
}