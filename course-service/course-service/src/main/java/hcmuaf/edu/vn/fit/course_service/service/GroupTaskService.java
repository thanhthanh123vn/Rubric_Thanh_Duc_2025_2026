package hcmuaf.edu.vn.fit.course_service.service;



import hcmuaf.edu.vn.fit.course_service.dto.request.GroupTaskRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.GroupTaskResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Group;
import hcmuaf.edu.vn.fit.course_service.entity.GroupTask;
import hcmuaf.edu.vn.fit.course_service.entity.enums.TaskStatus;
import hcmuaf.edu.vn.fit.course_service.repository.GroupRepository;
import hcmuaf.edu.vn.fit.course_service.repository.GroupTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupTaskService {
    private final GroupTaskRepository groupTaskRepository;
    private final GroupRepository groupRepository;

    @Transactional
    public GroupTaskResponse createTask(GroupTaskRequest req, String assignerId) {
        Group group = groupRepository.findById(req.getGroupId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm"));

        GroupTask task = GroupTask.builder()
                .group(group)
                .title(req.getTitle())
                .description(req.getDescription())
                .assigneeId(req.getAssigneeId())
                .assignerId(assignerId)
                .status(TaskStatus.TODO)
                .deadline(req.getDeadline())
                .build();

        task = groupTaskRepository.save(task);
        return mapToResponse(task);
    }

    public List<GroupTaskResponse> getTasksByGroup(String groupId) {
        return groupTaskRepository.findByGroup_IdOrderByCreatedAtDesc(groupId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public GroupTaskResponse updateTaskStatus(String taskId, TaskStatus status, String userId) {
        GroupTask task = groupTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy task"));

        task.setStatus(status);
        return mapToResponse(groupTaskRepository.save(task));
    }

    @Transactional
    public void deleteTask(String taskId, String userId) {
        GroupTask task = groupTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy task"));

        groupTaskRepository.delete(task);
    }

    private GroupTaskResponse mapToResponse(GroupTask task) {
        return GroupTaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .assigneeId(task.getAssigneeId())
                .assignerId(task.getAssignerId())
                .status(task.getStatus())
                .deadline(task.getDeadline())
                .createdAt(task.getCreatedAt())
                .build();
    }
}