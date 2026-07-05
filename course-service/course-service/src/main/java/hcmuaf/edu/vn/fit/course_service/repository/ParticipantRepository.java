package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.entity.Participant;
import hcmuaf.edu.vn.fit.course_service.entity.enums.ParticipantRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, String> {
    Optional<Participant> findByConversation_IdAndUserId(String conversationId, String userId);
    boolean existsByConversation_IdAndUserIdAndParticipantRole(String conversationId, String userId, ParticipantRole participantRole);
}
