package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.request.GenerateExamRequest;
import hcmuaf.edu.vn.fit.course_service.entity.*;
import hcmuaf.edu.vn.fit.course_service.entity.enums.Difficulty;
import hcmuaf.edu.vn.fit.course_service.entity.enums.QuestionType;
import hcmuaf.edu.vn.fit.course_service.exception.BadRequestException;
import hcmuaf.edu.vn.fit.course_service.exception.ResourceNotFoundException;
import hcmuaf.edu.vn.fit.course_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssessmentPaperService {

    private final AssessmentRepository assessmentRepository;
    private final QuestionBankRepository questionBankRepository;
    private final QuestionRepository questionRepository;
    private final AssessmentPaperRepository assessmentPaperRepository;

    public AssessmentPaper generateExamPaper(GenerateExamRequest request) {

        Assessment assessment = assessmentRepository.findById(request.getAssessmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài đánh giá (Assessment)"));


        QuestionBank bank = questionBankRepository.findById(request.getQuestionBankId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Kho câu hỏi"));

        List<String> bankQuestionIds = bank.getQuestionIds();
        if (bankQuestionIds == null || bankQuestionIds.isEmpty()) {
            throw new BadRequestException("Kho câu hỏi hiện đang trống!");
        }


        List<Question> allQuestions = questionRepository.findByIdInAndType(bankQuestionIds, QuestionType.MULTIPLE_CHOICE);


        if (request.getChapterId() != null && !request.getChapterId().isEmpty()) {
            allQuestions = allQuestions.stream()
                    .filter(q -> request.getChapterId().equals(q.getChapterId()))
                    .collect(Collectors.toList());
        }
        if (request.getCloId() != null && !request.getCloId().isEmpty()) {
            allQuestions = allQuestions.stream()
                    .filter(q -> q.getCloIds() != null && q.getCloIds().contains(request.getCloId()))
                    .collect(Collectors.toList());
        }


        List<Question> easyQuestions = allQuestions.stream().filter(q -> q.getDifficulty() == Difficulty.EASY).collect(Collectors.toList());
        List<Question> mediumQuestions = allQuestions.stream().filter(q -> q.getDifficulty() == Difficulty.MEDIUM).collect(Collectors.toList());
        List<Question> hardQuestions = allQuestions.stream().filter(q -> q.getDifficulty() == Difficulty.HARD).collect(Collectors.toList());


        if (easyQuestions.size() < request.getEasyCount() ||
                mediumQuestions.size() < request.getMediumCount() ||
                hardQuestions.size() < request.getHardCount()) {
            throw new BadRequestException("Kho câu hỏi không đủ số lượng câu để thỏa mãn cấu hình đề thi!");
        }


        Collections.shuffle(easyQuestions);
        Collections.shuffle(mediumQuestions);
        Collections.shuffle(hardQuestions);

        // 7. Bốc đúng số lượng yêu cầu
        List<String> selectedQuestionIds = new ArrayList<>();
        selectedQuestionIds.addAll(easyQuestions.stream().limit(request.getEasyCount()).map(Question::getId).toList());
        selectedQuestionIds.addAll(mediumQuestions.stream().limit(request.getMediumCount()).map(Question::getId).toList());
        selectedQuestionIds.addAll(hardQuestions.stream().limit(request.getHardCount()).map(Question::getId).toList());

        // Xáo trộn một lần nữa để các câu Dễ/Trung Bình/Khó nằm xen kẽ nhau trong đề
        Collections.shuffle(selectedQuestionIds);

        // 8. Tạo và lưu đề thi (AssessmentPaper)
        // Nếu bài thi đã từng sinh đề rồi, có thể xóa đề cũ đi hoặc cập nhật lại
        assessmentPaperRepository.findByAssessmentId(assessment.getAssessmentId())
                .ifPresent(existing -> assessmentPaperRepository.delete(existing));

        AssessmentPaper paper = AssessmentPaper.builder()
                .assessmentId(assessment.getAssessmentId())
                .sourceQuestionBankId(bank.getId())
                .questionIds(selectedQuestionIds)
                .shuffleQuestions(true) // Mặc định đảo câu hỏi lúc hiển thị
                .shuffleOptions(true)   // Mặc định đảo đáp án A B C D
                .build();

        return assessmentPaperRepository.save(paper);
    }
}