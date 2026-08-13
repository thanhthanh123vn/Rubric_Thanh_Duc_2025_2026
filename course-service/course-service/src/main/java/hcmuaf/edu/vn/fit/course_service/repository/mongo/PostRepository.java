package hcmuaf.edu.vn.fit.course_service.repository.mongo;

import hcmuaf.edu.vn.fit.course_service.entity.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
@Repository
public interface PostRepository extends MongoRepository<Post, String> {


    Page<Post> findByOfferingIdOrderByCreatedAtDesc(String offeringId, Pageable pageable);

}