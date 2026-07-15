package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.request.GroupTaskRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.GroupTaskResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.AssessmentEvidenceResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.AssessmentEvidenceTaskResponse;
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
import java.util.LinkedHashMap;
import java.util.Map;
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

    @Transactional(readOnly = true)
    public AssessmentEvidenceResponse getAssessmentEvidence(
            String offeringId,
            String studentId,
            LocalDateTime submittedAt) {
        LocalDateTime evidenceTime = submittedAt == null ? LocalDateTime.now() : submittedAt;
        Map<String, GroupTask> taskById = new LinkedHashMap<>();
        groupRepository.findMyGroups(offeringId, studentId).forEach(group ->
                groupTaskRepository.findByGroup_IdOrderByCreatedAtDesc(group.getId())
                        .forEach(task -> taskById.putIfAbsent(task.getId(), task)));
        List<GroupTask> tasks = taskById.values().stream()
                .filter(task -> task.getCreatedAt() == null || !task.getCreatedAt().isAfter(evidenceTime))
                .filter(task -> Objects.equals(task.getAssigneeId(), studentId)
                        || (Boolean.TRUE.equals(task.getAssignToGroup())
                        && Objects.equals(task.getCompletedById(), studentId)
                        && task.getCompletedAt() != null
                        && !task.getCompletedAt().isAfter(evidenceTime)))
                .toList();

        List<AssessmentEvidenceTaskResponse> taskEvidence = tasks.stream()
                .map(task -> {
                    boolean completed = task.getCompletedAt() != null
                            && !task.getCompletedAt().isAfter(evidenceTime);
                    TaskStatus evidenceStatus = completed
                            ? TaskStatus.COMPLETED
                            : task.getStatus() == TaskStatus.TODO ? TaskStatus.TODO : TaskStatus.IN_PROGRESS;
                    boolean completedLate = completed
                            && task.getDeadline() != null
                            && task.getCompletedAt() != null
                            && task.getCompletedAt().isAfter(task.getDeadline());
                    boolean overdue = !completed
                            && task.getDeadline() != null
                            && evidenceTime.isAfter(task.getDeadline());
                    return AssessmentEvidenceTaskResponse.builder()
                            .taskId(task.getId())
                            .title(task.getTitle())
                            .groupId(task.getGroup().getId())
                            .groupName(task.getGroup().getGroupName())
                            .status(evidenceStatus)
                            .deadline(task.getDeadline())
                            .completedAt(completed ? task.getCompletedAt() : null)
                            .completedLate(completedLate)
                            .overdue(overdue)
                            .build();
                })
                .toList();

        int completedTasks = (int) taskEvidence.stream().filter(task -> task.getStatus() == TaskStatus.COMPLETED).count();
        int completedLateTasks = (int) taskEvidence.stream().filter(AssessmentEvidenceTaskResponse::isCompletedLate).count();
        int overdueTasks = (int) taskEvidence.stream().filter(AssessmentEvidenceTaskResponse::isOverdue).count();
        int inProgressTasks = (int) taskEvidence.stream().filter(task -> task.getStatus() == TaskStatus.IN_PROGRESS).count();
        int todoTasks = (int) taskEvidence.stream().filter(task -> task.getStatus() == TaskStatus.TODO).count();
        double completionRate = tasks.isEmpty()
                ? 0
                : Math.round(completedTasks * 1000.0 / tasks.size()) / 10.0;

        return AssessmentEvidenceResponse.builder()
                .studentId(studentId)
                .totalAssignedTasks(tasks.size())
                .completedTasks(completedTasks)
                .completedOnTimeTasks(completedTasks - completedLateTasks)
                .completedLateTasks(completedLateTasks)
                .overdueTasks(overdueTasks)
                .inProgressTasks(inProgressTasks)
                .todoTasks(todoTasks)
                .completionRate(completionRate)
                .tasks(taskEvidence)
                .build();
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
