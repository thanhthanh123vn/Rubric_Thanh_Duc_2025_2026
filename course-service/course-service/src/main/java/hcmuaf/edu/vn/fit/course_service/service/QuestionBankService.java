package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.request.QuestionBankRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.QuestionBankResponse;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.QuestionBank;
import hcmuaf.edu.vn.fit.course_service.repository.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.QuestionBankRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionBankService {

    private final QuestionBankRepository questionBankRepository;
    private final CourseOfferingRepository courseOfferingRepository;

    // --- Hàm Helper để map Entity sang DTO ---
    private QuestionBankResponse mapToResponse(QuestionBank bank) {
        return QuestionBankResponse.builder()
                .id(bank.getId()) // Kế thừa từ AbstractEntity
                .name(bank.getName())

                .offeringId(bank.getOfferingId())
                .lecturerId(bank.getLecturerId())
                .build();
    }

    // 1. Tạo kho câu hỏi mới
    public QuestionBankResponse createQuestionBank(
            QuestionBankRequest request,
            String lecturerId
    ) {

        QuestionBank bank = QuestionBank.builder()
                .name(request.getName())
                .offeringId(request.getOfferingId())
                .lecturerId(lecturerId)
                .build();

        QuestionBank savedBank =
                questionBankRepository.save(bank);

        return mapToResponse(savedBank);
    }

    // 2. Cập nhật tên kho câu hỏi
    public QuestionBankResponse updateQuestionBank(String id, QuestionBankRequest request) {
        QuestionBank bank = questionBankRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kho câu hỏi với ID: " + id));

        bank.setName(request.getName());
        QuestionBank updatedBank = questionBankRepository.save(bank);
        return mapToResponse(updatedBank); // Trả về DTO
    }

    // 3. Xóa kho câu hỏi (Giữ nguyên vì hàm này trả về void)
    public void deleteQuestionBank(String id) {
        if (!questionBankRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy kho câu hỏi để xóa");
        }
        // TODO: Cần kiểm tra xem kho này có đang chứa câu hỏi nào không trước khi xóa
        questionBankRepository.deleteById(id);
    }

    // 4. Lấy danh sách kho theo môn học
    public List<QuestionBankResponse> getBanksByOfferingId(String offeringId) {

        List<QuestionBank> banks = questionBankRepository.findByOfferingId(offeringId);

        return banks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}