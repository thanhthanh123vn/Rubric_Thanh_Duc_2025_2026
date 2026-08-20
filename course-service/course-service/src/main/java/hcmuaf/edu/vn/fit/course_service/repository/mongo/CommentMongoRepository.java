
package hcmuaf.edu.vn.fit.course_service.repository.mongo;

import hcmuaf.edu.vn.fit.course_service.entity.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentMongoRepository extends MongoRepository<Comment, String> {

    List<Comment> findByPostIdOrderByCreatedAtAsc(String postId);
}