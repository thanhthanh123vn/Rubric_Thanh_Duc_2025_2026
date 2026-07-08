package hcmuaf.edu.vn.fit.course_service.repository.jpa;

import hcmuaf.edu.vn.fit.course_service.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {

}