package hcmuaf.edu.vn.fit.course_service.service;


import hcmuaf.edu.vn.fit.course_service.dto.response.SubmitStudentExamResponse;
import hcmuaf.edu.vn.fit.course_service.entity.enums.AnswerType;
import org.springframework.stereotype.Service;

@Service
public class StudentExamService {

    public SubmitStudentExamResponse submit(com.yourapp.exam.dto.SubmitStudentExamRequest request) {
        // 1) check exam tồn tại + đang mở + đúng student
        // 2) check quá hạn (nếu autoSubmit=true cho phép nộp tự động)
        // 3) validate từng answer:
        //    - MULTIPLE_CHOICE => selectedOptionIndex != null
        //    - ESSAY/SHORT_ANSWER => textAnswer != null/blank
        // 4) upsert attempt + answers
        // 5) khóa attempt (không cho sửa sau submit)
        // 6) chấm điểm tự động phần trắc nghiệm nếu cần

        int totalAnswered = (int) request.getAnswers().stream().filter(a -> {
            if (a.getType() == AnswerType.MULTIPLE_CHOICE) {
                return a.getSelectedOptionIndex() != null;
            }
            return a.getTextAnswer() != null && !a.getTextAnswer().trim().isEmpty();
        }).count();

        return SubmitStudentExamResponse.builder()
                .examId(request.getExamId())
                .attemptId("ATTEMPT_123")
                .status("SUBMITTED")
                .totalAnswered(totalAnswered)
                .build();
    }
}