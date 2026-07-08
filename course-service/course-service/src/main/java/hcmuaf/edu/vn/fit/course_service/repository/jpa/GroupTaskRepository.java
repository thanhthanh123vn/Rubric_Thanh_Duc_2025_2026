package hcmuaf.edu.vn.fit.course_service.repository.jpa;

import hcmuaf.edu.vn.fit.course_service.entity.GroupTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GroupTaskRepository extends JpaRepository<GroupTask, String> {
    List<GroupTask> findByGroup_IdOrderByCreatedAtDesc(String groupId);
}