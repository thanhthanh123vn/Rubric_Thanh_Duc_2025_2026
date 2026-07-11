package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.request.GroupTaskRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.GroupTaskResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Group;
import hcmuaf.edu.vn.fit.course_service.entity.GroupTask;
import hcmuaf.edu.vn.fit.course_service.entity.Participant;
import hcmuaf.edu.vn.fit.course_service.entity.enums.ParticipantRole;
import hcmuaf.edu.vn.fit.course_service.entity.enums.TaskStatus;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.GroupRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.GroupTaskRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupTaskService {
    private static final String GROUP_ASSIGNEE = "__GROUP__";

    private final GroupTaskRepository groupTaskRepository;
    private final GroupRepository groupRepository;
    private final ParticipantRepository participantRepository;
    private final S3Service s3Service;

    @Transactional
    public GroupTaskResponse createTask(GroupTaskRequest req, String assignerId) {
        Group group = groupRepository.findById(req.getGroupId())
                .orElseThrow(() -> new RuntimeException("Khong tim thay nhom"));

        validateLeaderPermission(group, assignerId);

        boolean assignToGroup = Boolean.TRUE.equals(req.getAssignToGroup()) || GROUP_ASSIGNEE.equals(req.getAssigneeId());
        if (!assignToGroup && (req.getAssigneeId() == null || req.getAssigneeId().isBlank())) {
            throw new RuntimeException("Vui long chon nguoi nhan task hoac giao cho ca nhom");
        }

        GroupTask task = GroupTask.builder()
                .group(group)
                .title(req.getTitle())
                .description(req.getDescription())
                .assigneeId(assignToGroup ? null : req.getAssigneeId())
                .assignToGroup(assignToGroup)
                .assignerId(assignerId)
                .status(TaskStatus.TODO)
                .deadline(req.getDeadline())
                .build();

        task = groupTaskRepository.save(task);
        return mapToResponse(task);
    }

    public List<GroupTaskResponse> getTasksByGroup(String groupId, String userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay nhom"));
        Participant participant = getParticipant(group, userId);

        return groupTaskRepository.findByGroup_IdOrderByCreatedAtDesc(groupId)
                .stream()
                .filter(task -> canViewTask(task, participant))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public GroupTaskResponse updateTaskStatus(
            String taskId,
            TaskStatus status,
            String userId,
            String resultNote,
            String resultLink,
            MultipartFile file
    ) throws IOException {
        GroupTask task = groupTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay task"));
        Participant participant = getParticipant(task.getGroup(), userId);

        if (!canUpdateTask(task, participant)) {
            throw new RuntimeException("Ban khong co quyen cap nhat cong viec nay");
        }

        task.setStatus(status);
        if (status == TaskStatus.COMPLETED) {
            task.setResultNote(normalizeText(resultNote));
            task.setResultLink(normalizeText(resultLink));
            task.setCompletedById(userId);
            task.setCompletedAt(LocalDateTime.now());

            if (file != null && !file.isEmpty()) {
                task.setResultFileUrl(s3Service.uploadFile(file));
            }
        } else {
            task.setResultNote(null);
            task.setResultLink(null);
            task.setCompletedById(null);
            task.setCompletedAt(null);
            if (file != null && !file.isEmpty()) {
                task.setResultFileUrl(s3Service.uploadFile(file));
            } else {
                task.setResultFileUrl(null);
            }
        }

        return mapToResponse(groupTaskRepository.save(task));
    }

    @Transactional
    public void deleteTask(String taskId, String userId) {
        GroupTask task = groupTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay task"));

        validateLeaderPermission(task.getGroup(), userId);
        groupTaskRepository.delete(task);
    }

    private void validateLeaderPermission(Group group, String userId) {
        Participant participant = getParticipant(group, userId);

        if (participant.getParticipantRole() != ParticipantRole.ADMIN) {
            throw new RuntimeException("Chi nhom truong moi duoc tao va giao task");
        }
    }

    private Participant getParticipant(Group group, String userId) {
        return participantRepository
                .findByConversation_IdAndUserId(group.getConversation().getId(), userId)
                .orElseThrow(() -> new RuntimeException("Ban khong thuoc nhom nay"));
    }

    private boolean canViewTask(GroupTask task, Participant participant) {
        if (participant.getParticipantRole() == ParticipantRole.ADMIN) {
            return true;
        }

        return Boolean.TRUE.equals(task.getAssignToGroup()) || Objects.equals(task.getAssigneeId(), participant.getUserId());
    }

    private boolean canUpdateTask(GroupTask task, Participant participant) {
        if (participant.getParticipantRole() == ParticipantRole.ADMIN) {
            return true;
        }

        return Boolean.TRUE.equals(task.getAssignToGroup()) || Objects.equals(task.getAssigneeId(), participant.getUserId());
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private GroupTaskResponse mapToResponse(GroupTask task) {
        return GroupTaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .assigneeId(task.getAssigneeId())
                .assignToGroup(Objects.equals(task.getAssignToGroup(), Boolean.TRUE))
                .assignerId(task.getAssignerId())
                .status(task.getStatus())
                .deadline(task.getDeadline())
                .createdAt(task.getCreatedAt())
                .resultNote(task.getResultNote())
                .resultLink(task.getResultLink())
                .resultFileUrl(task.getResultFileUrl())
                .completedById(task.getCompletedById())
                .completedAt(task.getCompletedAt())
                .build();
    }
}
