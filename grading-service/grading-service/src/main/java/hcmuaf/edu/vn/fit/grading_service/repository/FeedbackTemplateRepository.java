package hcmuaf.edu.vn.fit.grading_service.repository;

import hcmuaf.edu.vn.fit.grading_service.entity.FeedbackTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FeedbackTemplateRepository extends JpaRepository<FeedbackTemplate, Long> {
    List<FeedbackTemplate> findByUserIdOrderByUpdatedAtDescIdDesc(String userId);

    Optional<FeedbackTemplate> findByUserIdAndContentIgnoreCase(String userId, String content);
}
