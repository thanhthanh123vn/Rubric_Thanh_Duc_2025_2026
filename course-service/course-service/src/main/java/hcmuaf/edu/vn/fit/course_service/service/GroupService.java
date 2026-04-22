package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.GroupRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.GroupResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.SinhVienResponse;
import hcmuaf.edu.vn.fit.course_service.entity.*;
import hcmuaf.edu.vn.fit.course_service.entity.enums.ConversationType;
import hcmuaf.edu.vn.fit.course_service.entity.enums.ParticipantRole;
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
    // Nếu muốn check xem user có tồn tại thật không, bạn có thể inject UserClient vào đây
    // private final UserClient userClient;

    @Transactional
    public GroupResponse createGroup(GroupRequest req) {

        // 1. TẠO PHÒNG CHAT (CONVERSATION)
        Conversation conversation = new Conversation();
        conversation.setConversationName(req.getGroupName());
        conversation.setConversationType(ConversationType.GROUP);
        Conversation savedConversation = conversationRepository.save(conversation);

        // 2. TẠO NHÓM (GROUP)
        Group group = groupMapper.toGroup(req);

        // Map thủ công các Object quan hệ từ Database
        group.setConversation(savedConversation);

        CourseOffering offering = courseOfferingRepository.findById(req.getOfferingId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Lớp học phần với mã: " + req.getOfferingId()));
        group.setCourseOffering(offering);

        Group savedGroup = groupRepository.save(group);

        // 3. THÊM THÀNH VIÊN VÀO PHÒNG CHAT (PARTICIPANT)
        List<Participant> participants = new ArrayList<>();

        for (String memberId : req.getMemberIds()) {

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
}