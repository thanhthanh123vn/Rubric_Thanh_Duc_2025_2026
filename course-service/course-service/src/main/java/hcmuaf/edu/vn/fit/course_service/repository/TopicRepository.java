package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface TopicRepository extends JpaRepository<Topic,String> {

    @Query("SELECT t FROM Topic t WHERE t.courseOffering.offeringId = :offeringId")
    List<Topic> findByOfferingId(@Param("offeringId") String offeringId);

    Optional<Topic> findById(String id);
}
