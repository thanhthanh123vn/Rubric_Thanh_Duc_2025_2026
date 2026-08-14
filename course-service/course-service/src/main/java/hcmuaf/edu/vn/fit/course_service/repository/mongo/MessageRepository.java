package hcmuaf.edu.vn.fit.course_service.repository.mongo;

import hcmuaf.edu.vn.fit.course_service.entity.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {



    Slice<Message> findByOfferingIdOrderByCreatedAtDesc(String offeringId, Pageable pageable);


    Slice<Message> findByOfferingIdOrderByCreatedAtAsc(String offeringId, Pageable pageable);


    Slice<Message> findByConversationIdOrderByCreatedAtAsc(String conversationId, Pageable pageable);



    @Query("{ 'offeringId': ?0, 'senderId': { $ne: ?1 }, 'createdAt': { $gt: ?2 } }")
    Long countNewMessages(String offeringId, String userId, Date lastAccessTime);


   Long countByOfferingIdAndSenderIdNotAndCreatedAtGreaterThan(String offeringId, String userId, Date lastAccessTime);
}