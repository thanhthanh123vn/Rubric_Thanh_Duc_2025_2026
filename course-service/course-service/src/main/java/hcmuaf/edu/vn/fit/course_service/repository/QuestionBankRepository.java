package hcmuaf.edu.vn.fit.course_service.repository;


import hcmuaf.edu.vn.fit.course_service.entity.QuestionBank;



import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface QuestionBankRepository extends MongoRepository<QuestionBank, String> {

    List<QuestionBank> findByOfferingId(String offeringId);
    Optional<QuestionBank> findByIdAndOfferingId(
            String id,
            String offeringId
    );

    List<QuestionBank> findAllByOfferingIdIn(Collection<String> courseIds);

}