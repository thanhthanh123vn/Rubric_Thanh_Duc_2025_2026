package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.request.GroupRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.GroupResponse;
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
    private final UserRepository userRepository;
    private final CourseOfferingRepository courseOfferingRepository;

    @Transactional
    public GroupResponse createGroup(GroupRequest req) {

        // 1. TẠO PHÒNG CHAT (CONVERSATION)
        Conversation conversation = new Conversation();
        conversation.setConversationName(req.getGroupName());
        conversation.setConversationType(ConversationType.GROUP);
        Conversation savedConversation = conversationRepository.save(conversation);

        // 2. TẠO NHÓM (GROUP)
        // Thay vì set tay từng cái, gọi Mapper gánh phần mapping dữ liệu cơ bản
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
            User user = userRepository.findById(memberId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng có ID: " + memberId));

            Participant participant = new Participant();
            participant.setConversation(savedConversation);
            participant.setUser(user);


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
}