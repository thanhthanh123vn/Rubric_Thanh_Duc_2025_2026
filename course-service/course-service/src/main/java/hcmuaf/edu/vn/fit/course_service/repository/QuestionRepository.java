package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, String> {


    List<Question> findByOfferingId(String offeringId);
    boolean existsByContentAndOfferingId(String content, String offeringId);


    long countByOfferingId(String offeringId);

    // 2. Đếm số lượng câu hỏi cho danh sách offeringId (Dùng cho CourseList)
    @Query("SELECT q.offeringId, COUNT(q) FROM Question q WHERE q.offeringId IN :offeringIds GROUP BY q.offeringId")
    List<Object[]> countQuestionsByOfferingIds(@Param("offeringIds") List<String> offeringIds);


}