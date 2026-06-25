package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.GroupRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.GroupResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.SinhVienResponse;
import hcmuaf.edu.vn.fit.course_service.entity.*;
import hcmuaf.edu.vn.fit.course_service.entity.enums.ConversationType;
import hcmuaf.edu.vn.fit.course_service.entity.enums.ParticipantRole;
import hcmuaf.edu.vn.fit.course_service.exception.BadRequestException;
import hcmuaf.edu.vn.fit.course_service.mapper.GroupMapper;
import hcmuaf.edu.vn.fit.course_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMapper groupMapper;
    private final ParticipantRepository participantRepository;
    private final ConversationRepository conversationRepository;
    private final CourseOfferingRepository courseOfferingRepository;
     private final UserClient userClient;


    @Transactional
    public GroupResponse createGroup(GroupRequest req) {

        // 1. TẠO PHÒNG CHAT (CONVERSATION)
        Conversation conversation = new Conversation();
        conversation.setConversationName(req.getGroupName());
        conversation.setConversationType(ConversationType.GROUP);
        Conversation savedConversation = conversationRepository.save(conversation);


        Group group = groupMapper.toGroup(req);

        group.setConversation(savedConversation);

        CourseOffering offering = courseOfferingRepository.findById(req.getOfferingId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Lớp học phần với mã: " + req.getOfferingId()));
        group.setCourseOffering(offering);

        Group savedGroup = groupRepository.save(group);


        List<Participant> participants = new ArrayList<>();

        for (String memberId : req.getMemberIds()) {
            if (groupRepository.existsStudentInOffering(
                    memberId,
                    req.getOfferingId())) {

                throw new BadRequestException(
                        "Sinh viên " + memberId +
                                " đã thuộc một nhóm của học phần này"
                );
            }
            validateUser(memberId);
            Participant participant = new Participant();
            participant.setConversation(savedConversation);


            participant.setUserId(memberId);

            participant.setParticipantRole(
                    memberId.equals(req.getCreatedById()) ? ParticipantRole.ADMIN : ParticipantRole.MEMBER
            );

            participants.add(participant);
        }

        participantRepository.saveAll(participants);

        savedConversation.setParticipants(participants);
        return groupMapper.toGroupResponse(savedGroup);
    }

    public List<GroupResponse> getMyGroups(String offeringId, String userId) {
        List<Group> groups = groupRepository.findMyGroups(offeringId, userId);
        return groupMapper.toGroupResponseList(groups);
    }

    public List<GroupResponse> getGroupsByOfferingId(String offeringId) {
        List<Group> groups = groupRepository.findByOfferingId(offeringId);
        return groupMapper.toGroupResponseList(groups);
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
}