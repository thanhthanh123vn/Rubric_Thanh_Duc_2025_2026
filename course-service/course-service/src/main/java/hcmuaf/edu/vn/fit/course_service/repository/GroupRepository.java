package hcmuaf.edu.vn.fit.course_service.repository;
import hcmuaf.edu.vn.fit.course_service.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group,Integer> {
    @Query("SELECT DISTINCT  g FROM Group g " +
            "JOIN Conversation c ON g.conversation.id = c.id " +
            "JOIN Participant p ON p.conversation.id = c.id " +
            "WHERE g.courseOffering.offeringId = :offeringId AND p.userId = :userId")
    List<Group> findMyGroups(@Param("offeringId") String offeringId, @Param("userId") String userId);


    @Query("SELECT g FROM Group g WHERE g.courseOffering.offeringId = :offeringId")
    List<Group> findByOfferingId(@Param("offeringId") String offeringId);
}
