package hcmuaf.edu.vn.fit.course_service.service;
import hcmuaf.edu.vn.fit.course_service.dto.response.ConversationResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Conversation;
import hcmuaf.edu.vn.fit.course_service.mapper.ConversationMapper;
import hcmuaf.edu.vn.fit.course_service.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationMapper conversationMapper;


    public ConversationResponse getConversationById(String id) {
        Conversation conversation = conversationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng chat"));


        return conversationMapper.toResponse(conversation);
    }
}