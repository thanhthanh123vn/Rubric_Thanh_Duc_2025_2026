package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface TopicRepository extends JpaRepository<Topic,String> {

    List<Topic> findByOfferingId(String offeringId);
    Optional<Topic> findById(String id);
}
