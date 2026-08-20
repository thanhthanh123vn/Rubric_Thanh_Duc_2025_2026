// File: hcmuaf.edu.vn.fit.course_service.entity.Comment.java
package hcmuaf.edu.vn.fit.course_service.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.time.Instant;
import java.util.Date;

@Document(collection = "comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    private String id;


    @Field("post_id")
    private String postId;

    @Field("user_id")
    private String userId;

    private String content;

    @Field("parent_id")
    private String parentId;


    @Field("created_at")
    @Builder.Default
    private Date createdAt = Date.from(Instant.now());
}