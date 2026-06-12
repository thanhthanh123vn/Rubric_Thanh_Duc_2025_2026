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
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionBankService {

    private final QuestionBankRepository questionBankRepository;
    private final CourseOfferingRepository courseOfferingRepository;

    private String resolveCourseName(String offeringId) {
        return courseOfferingRepository.findById(offeringId)
                .map(CourseOffering::getCourse)
                .filter(Objects::nonNull)
                .map(course -> course.getCourseName())
                .orElse("");
    }

    private QuestionBankResponse mapToResponse(QuestionBank bank) {
        return QuestionBankResponse.builder()
                .id(bank.getId())
                .name(bank.getName())
                .offeringId(bank.getOfferingId())
                .lecturerId(bank.getLecturerId())
                .isPublic(Boolean.TRUE.equals(bank.getIsPublic()))
                .courseName(resolveCourseName(bank.getOfferingId()))
                .sharePermissions(bank.getSharePermissions())
                .build();
    }

    public QuestionBankResponse createQuestionBank(QuestionBankRequest request, String lecturerId) {
        QuestionBank bank = QuestionBank.builder()
                .name(request.getName())
                .offeringId(request.getOfferingId())
                .lecturerId(lecturerId)
                .isPublic(Boolean.TRUE.equals(request.getIsPublic()))
                .sharePermissions(Boolean.TRUE.equals(request.getIsPublic()) ? request.getSharePermissions() : List.of())
                .build();

        return mapToResponse(questionBankRepository.save(bank));
    }

    public QuestionBankResponse updateQuestionBank(String id, QuestionBankRequest request, String lecturerId) {
        QuestionBank bank = questionBankRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kho câu hỏi với ID: " + id));

        if (!Objects.equals(bank.getLecturerId(), lecturerId)) {
            throw new RuntimeException("Bạn không có quyền cập nhật kho câu hỏi này");
        }

        bank.setName(request.getName());
        bank.setIsPublic(Boolean.TRUE.equals(request.getIsPublic()));
        bank.setSharePermissions(Boolean.TRUE.equals(request.getIsPublic()) ? request.getSharePermissions() : List.of());
        return mapToResponse(questionBankRepository.save(bank));
    }

    public void deleteQuestionBank(String id, String lecturerId) {
        QuestionBank bank = questionBankRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kho câu hỏi để xóa"));

        if (!Objects.equals(bank.getLecturerId(), lecturerId)) {
            throw new RuntimeException("Bạn không có quyền xóa kho câu hỏi này");
        }

        questionBankRepository.deleteById(id);
    }

    public List<QuestionBankResponse> getBanksByOfferingId(String offeringId) {
        return questionBankRepository.findByOfferingId(offeringId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<QuestionBankResponse> getBanksByLecturer(String lecturerId) {
        return questionBankRepository.findByLecturerId(lecturerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<QuestionBankResponse> getPublicBanks(String lecturerId) {
        return questionBankRepository.findByIsPublicTrueAndLecturerIdNot(lecturerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public QuestionBankResponse getBankById(String id) {
        QuestionBank bank = questionBankRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kho câu hỏi với ID: " + id));
        return mapToResponse(bank);
    }
}
