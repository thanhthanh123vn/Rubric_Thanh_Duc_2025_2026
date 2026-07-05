package hcmuaf.edu.vn.fit.course_service.repository;


import hcmuaf.edu.vn.fit.course_service.entity.QuestionBank;


import org.springframework.data.jpa.repository.Query;

import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface QuestionBankRepository extends MongoRepository<QuestionBank, String> {

    List<QuestionBank> findByOfferingId(String offeringId);
    List<QuestionBank> findByLecturerId(String lecturerId);
    List<QuestionBank> findByIsPublicTrueAndLecturerIdNot(String lecturerId);
    Optional<QuestionBank> findByIdAndOfferingId(
            String id,
            String offeringId
    );

    List<QuestionBank> findAllByOfferingIdIn(Collection<String> courseIds);

    List<QuestionBank> findByIsPublicTrue();

    List<QuestionBank> findByIsPublicTrueAndOfferingId(String offeringId);

    List<QuestionBank> findByIsPublicTrueAndCourseId(String courseId);



}
