package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.dto.response.OfferingQuestionCount;
import hcmuaf.edu.vn.fit.course_service.entity.Question;
import hcmuaf.edu.vn.fit.course_service.entity.enums.QuestionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface QuestionRepository extends MongoRepository<Question, String> {




        List<Question> findByOfferingId(String offeringId);

        boolean existsByContentAndOfferingId(
                String content,
                String offeringId
        );

        long countByOfferingId(String offeringId);
    @Aggregation(pipeline = {
            "{ '$match': { 'offeringId': { '$in': ?0 } } }",
            "{ '$group': { '_id': '$offeringId', 'count': { '$sum': 1 } } }"
    })
    List<OfferingQuestionCount> countQuestionsByOfferingIds(
            List<String> offeringIds
    );
    List<Question> findAllByOfferingIdIn(Set<String> offeringIds);

    List<Question> findByIdInAndType(List<String> ids, QuestionType type);
    }

