package hcmuaf.edu.vn.fit.course_service.repository.jpa;

import hcmuaf.edu.vn.fit.course_service.entity.SubmissionAttachmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface SubmissionAttachmentRepository extends JpaRepository<SubmissionAttachmentEntity, String> {
    List<SubmissionAttachmentEntity> findBySubmissionIdIn(Collection<String> submissionIds);

    List<SubmissionAttachmentEntity> findBySubmissionIdOrderByCreatedAtAsc(String submissionId);

    void deleteBySubmissionId(String submissionId);
}
