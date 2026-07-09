package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.GroupRequest;
import hcmuaf.edu.vn.fit.course_service.dto.request.SplitGroupRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.GroupResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.SinhVienResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.SplitGroupResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Conversation;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.Group;
import hcmuaf.edu.vn.fit.course_service.entity.Participant;
import hcmuaf.edu.vn.fit.course_service.entity.enums.ConversationType;
import hcmuaf.edu.vn.fit.course_service.entity.enums.ParticipantRole;
import hcmuaf.edu.vn.fit.course_service.exception.BadRequestException;
import hcmuaf.edu.vn.fit.course_service.mapper.GroupMapper;
import hcmuaf.edu.vn.fit.course_service.repository.ConversationRepository;
import hcmuaf.edu.vn.fit.course_service.repository.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.GroupRepository;
import hcmuaf.edu.vn.fit.course_service.repository.GroupTaskRepository;
import hcmuaf.edu.vn.fit.course_service.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMapper groupMapper;
    private final ParticipantRepository participantRepository;
    private final ConversationRepository conversationRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final GroupTaskRepository groupTaskRepository;
    private final UserClient userClient;

    @Transactional
    public GroupResponse createGroup(GroupRequest req) {
        List<String> memberIds = normalizeMemberIds(req.getMemberIds());
        if (isBlank(req.getOfferingId())) {
            throw new BadRequestException("Thiếu lớp học phần.");
        }
        if (isBlank(req.getCreatedById())) {
            throw new BadRequestException("Thiếu người tạo nhóm.");
        }
        if (isBlank(req.getGroupName())) {
            throw new BadRequestException("Vui lòng nhập tên nhóm.");
        }
        if (!memberIds.contains(req.getCreatedById())) {
            memberIds.add(0, req.getCreatedById());
        }

        CourseOffering offering = courseOfferingRepository.findById(req.getOfferingId())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy lớp học phần."));

        for (String memberId : memberIds) {
            if (groupRepository.existsStudentInOffering(memberId, req.getOfferingId())) {
                throw new BadRequestException("Sinh viên " + memberId + " đã thuộc một nhóm của học phần này.");
            }
            validateUser(memberId);
        }

        Conversation conversation = createConversation(req.getGroupName());
        Group group = groupMapper.toGroup(req);
        group.setCreatedById(req.getCreatedById());
        group.setGroupName(req.getGroupName().trim());
        group.setTopic(normalizeText(req.getTopic()));
        group.setConversation(conversation);
        group.setCourseOffering(offering);
        group.setParentGroup(null);

        Group savedGroup = groupRepository.save(group);
        List<Participant> participants = createParticipants(conversation, memberIds, req.getCreatedById());
        participantRepository.saveAll(participants);
        conversation.setParticipants(participants);
        savedGroup.setConversation(conversation);

        return groupMapper.toGroupResponse(savedGroup);
    }

    @Transactional
    public SplitGroupResponse splitGroup(String parentGroupId, SplitGroupRequest req, String requesterId) {
        Group rootGroup = groupRepository.findById(parentGroupId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy nhóm gốc."));
        if (rootGroup.getParentGroup() != null) {
            throw new BadRequestException("Chỉ được tách từ nhóm gốc.");
        }
        if (!groupRepository.findByParentGroup_Id(parentGroupId).isEmpty()) {
            throw new BadRequestException("Nhóm này đã được tách trước đó.");
        }

        validateLeaderPermission(rootGroup, requesterId);

        List<String> splitMemberIds = normalizeMemberIds(req.getMemberIds());
        if (splitMemberIds.isEmpty()) {
            throw new BadRequestException("Vui lòng chọn thành viên cho nhóm tách.");
        }
        if (isBlank(req.getGroupName())) {
            throw new BadRequestException("Vui lòng nhập tên nhóm tách.");
        }
        if (isBlank(req.getSubgroupLeaderId())) {
            throw new BadRequestException("Vui lòng chọn trưởng nhóm tách.");
        }
        if (!splitMemberIds.contains(req.getSubgroupLeaderId())) {
            throw new BadRequestException("Trưởng nhóm tách phải thuộc danh sách thành viên được chọn.");
        }

        List<String> allRootMemberIds = rootGroup.getConversation().getParticipants()
                .stream()
                .map(Participant::getUserId)
                .distinct()
                .toList();
        Map<String, Participant> rootParticipants = rootGroup.getConversation().getParticipants()
                .stream()
                .collect(Collectors.toMap(Participant::getUserId, Function.identity(), (left, right) -> left));

        for (String memberId : splitMemberIds) {
            if (!rootParticipants.containsKey(memberId)) {
                throw new BadRequestException("Sinh viên " + memberId + " không thuộc nhóm gốc.");
            }
            if (groupRepository.existsStudentInSubgroups(memberId, parentGroupId)) {
                throw new BadRequestException("Sinh viên " + memberId + " đã thuộc một nhóm tách của nhóm này.");
            }
        }

        if (splitMemberIds.size() >= allRootMemberIds.size()) {
            throw new BadRequestException("Cần chừa lại ít nhất 1 thành viên cho nhóm còn lại.");
        }

        List<String> remainingMemberIds = allRootMemberIds.stream()
                .filter(memberId -> !splitMemberIds.contains(memberId))
                .toList();
        if (remainingMemberIds.isEmpty()) {
            throw new BadRequestException("Không còn thành viên để tạo nhóm còn lại.");
        }

        String remainingLeaderId = remainingMemberIds.contains(requesterId)
                ? requesterId
                : remainingMemberIds.get(0);

        Group splitGroup = createSplitGroup(
                rootGroup,
                req.getGroupName().trim(),
                normalizeText(req.getTopic()),
                requesterId,
                splitMemberIds,
                req.getSubgroupLeaderId()
        );
        Group remainingGroup = createSplitGroup(
                rootGroup,
                buildRemainingGroupName(rootGroup.getGroupName()),
                normalizeText(rootGroup.getTopic()),
                requesterId,
                remainingMemberIds,
                remainingLeaderId
        );

        return SplitGroupResponse.builder()
                .createdGroups(List.of(
                        groupMapper.toGroupResponse(splitGroup),
                        groupMapper.toGroupResponse(remainingGroup)
                ))
                .build();
    }

    @Transactional
    public void dissolveGroup(String groupId, String requesterId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy nhóm."));

        validateLeaderPermission(group, requesterId);

        if (group.getParentGroup() == null) {
            List<Group> splitGroups = groupRepository.findByParentGroup_Id(groupId);
            for (Group splitGroup : splitGroups) {
                deleteGroupData(splitGroup);
            }
        }

        deleteGroupData(group);
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> getMyGroups(String offeringId, String userId) {
        return groupRepository.findMyGroups(offeringId, userId)
                .stream()
                .sorted(groupComparator())
                .map(groupMapper::toGroupResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> getGroupsByOfferingId(String offeringId) {
        return groupRepository.findByOfferingId(offeringId)
                .stream()
                .sorted(groupComparator())
                .map(groupMapper::toGroupResponse)
                .toList();
    }

    @Transactional
    public GroupResponse addMember(String groupId, String newMemberId, String requesterId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm"));
        String conversationId = group.getConversation().getId();

        Participant requester = participantRepository.findByConversation_IdAndUserId(conversationId, requesterId)
                .orElseThrow(() -> new RuntimeException("Bạn không thuộc nhóm này"));

        if (requester.getParticipantRole() != ParticipantRole.ADMIN) {
            throw new RuntimeException("Chỉ trưởng nhóm mới được thêm thành viên");
        }

        if (participantRepository.findByConversation_IdAndUserId(conversationId, newMemberId).isPresent()) {
            throw new RuntimeException("Thành viên này đã có trong nhóm");
        }

        validateUser(newMemberId);

        if (group.getParentGroup() == null) {
            if (groupRepository.existsStudentInOffering(newMemberId, group.getCourseOffering().getOfferingId())) {
                throw new RuntimeException("Sinh viên này đã thuộc một nhóm của học phần");
            }
        } else {
            boolean belongsToRoot = group.getParentGroup().getConversation().getParticipants()
                    .stream()
                    .anyMatch(participant -> Objects.equals(participant.getUserId(), newMemberId));
            if (!belongsToRoot) {
                throw new RuntimeException("Chỉ được thêm thành viên đã thuộc nhóm gốc");
            }
            if (groupRepository.existsStudentInSubgroups(newMemberId, group.getParentGroup().getId())) {
                throw new RuntimeException("Sinh viên này đã thuộc một nhóm tách khác");
            }
        }

        Participant newParticipant = new Participant();
        newParticipant.setConversation(group.getConversation());
        newParticipant.setUserId(newMemberId);
        newParticipant.setParticipantRole(ParticipantRole.MEMBER);
        participantRepository.save(newParticipant);

        group.getConversation().getParticipants().add(newParticipant);

        return groupMapper.toGroupResponse(group);
    }

    @Transactional
    public GroupResponse removeMember(String groupId, String memberIdToRemove, String requesterId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm"));
        String conversationId = group.getConversation().getId();

        Participant requester = participantRepository.findByConversation_IdAndUserId(conversationId, requesterId)
                .orElseThrow(() -> new RuntimeException("Bạn không thuộc nhóm này"));

        if (requester.getParticipantRole() != ParticipantRole.ADMIN && !requesterId.equals(memberIdToRemove)) {
            throw new RuntimeException("Bạn không có quyền xóa thành viên này");
        }

        Participant target = participantRepository.findByConversation_IdAndUserId(conversationId, memberIdToRemove)
                .orElseThrow(() -> new RuntimeException("Thành viên không tồn tại trong nhóm"));

        participantRepository.delete(target);
        group.getConversation().getParticipants().remove(target);

        return groupMapper.toGroupResponse(group);
    }

    @Transactional
    public GroupResponse changeMemberRole(String groupId, String targetMemberId, ParticipantRole newRole, String requesterId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm"));
        String conversationId = group.getConversation().getId();

        Participant requester = participantRepository.findByConversation_IdAndUserId(conversationId, requesterId)
                .orElseThrow(() -> new RuntimeException("Bạn không thuộc nhóm này"));

        if (requester.getParticipantRole() != ParticipantRole.ADMIN) {
            throw new RuntimeException("Chỉ trưởng nhóm mới được thay đổi quyền");
        }

        Participant target = participantRepository.findByConversation_IdAndUserId(conversationId, targetMemberId)
                .orElseThrow(() -> new RuntimeException("Thành viên không tồn tại trong nhóm"));

        target.setParticipantRole(newRole);
        participantRepository.save(target);

        return groupMapper.toGroupResponse(group);
    }

    private Comparator<Group> groupComparator() {
        return Comparator
                .comparing((Group group) -> group.getParentGroup() != null)
                .thenComparing(group -> group.getParentGroup() != null ? group.getParentGroup().getGroupName() : group.getGroupName(), String.CASE_INSENSITIVE_ORDER)
                .thenComparing(Group::getGroupName, String.CASE_INSENSITIVE_ORDER);
    }

    private Conversation createConversation(String groupName) {
        Conversation conversation = new Conversation();
        conversation.setConversationName(groupName.trim());
        conversation.setConversationType(ConversationType.GROUP);
        return conversationRepository.save(conversation);
    }

    private Group createSplitGroup(
            Group rootGroup,
            String groupName,
            String topic,
            String createdById,
            List<String> memberIds,
            String adminUserId
    ) {
        Conversation conversation = createConversation(groupName);
        Group splitGroup = new Group();
        splitGroup.setCourseOffering(rootGroup.getCourseOffering());
        splitGroup.setCreatedById(createdById);
        splitGroup.setGroupName(groupName);
        splitGroup.setTopic(topic);
        splitGroup.setConversation(conversation);
        splitGroup.setParentGroup(rootGroup);

        Group savedSplitGroup = groupRepository.save(splitGroup);
        List<Participant> participants = createParticipants(conversation, memberIds, adminUserId);
        participantRepository.saveAll(participants);
        conversation.setParticipants(participants);
        savedSplitGroup.setConversation(conversation);
        return savedSplitGroup;
    }

    private void deleteGroupData(Group group) {
        String conversationId = group.getConversation().getId();
        groupTaskRepository.deleteByGroup_Id(group.getId());
        groupRepository.delete(group);
        conversationRepository.deleteById(conversationId);
    }

    private String buildRemainingGroupName(String rootGroupName) {
        return rootGroupName + " - Còn lại";
    }

    private List<Participant> createParticipants(Conversation conversation, List<String> memberIds, String adminUserId) {
        List<Participant> participants = new ArrayList<>();
        for (String memberId : memberIds) {
            Participant participant = new Participant();
            participant.setConversation(conversation);
            participant.setUserId(memberId);
            participant.setParticipantRole(Objects.equals(memberId, adminUserId) ? ParticipantRole.ADMIN : ParticipantRole.MEMBER);
            participants.add(participant);
        }
        return participants;
    }

    private List<String> normalizeMemberIds(List<String> memberIds) {
        if (memberIds == null) {
            return new ArrayList<>();
        }

        Set<String> uniqueIds = memberIds.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .collect(Collectors.toCollection(LinkedHashSet::new));
        return new ArrayList<>(uniqueIds);
    }

    private void validateUser(String userId) {
        try {
            SinhVienResponse user = userClient.getSinhVien(userId);
            if (user == null) {
                throw new RuntimeException("User không tồn tại");
            }
        } catch (Exception e) {
            throw new RuntimeException("User không hợp lệ");
        }
    }

    private void validateLeaderPermission(Group group, String userId) {
        Participant participant = participantRepository.findByConversation_IdAndUserId(group.getConversation().getId(), userId)
                .orElseThrow(() -> new RuntimeException("Bạn không thuộc nhóm này"));

        if (participant.getParticipantRole() != ParticipantRole.ADMIN) {
            throw new RuntimeException("Chỉ trưởng nhóm mới được thực hiện thao tác này");
        }
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
