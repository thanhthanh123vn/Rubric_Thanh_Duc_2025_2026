package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.request.QuestionRequest;
import hcmuaf.edu.vn.fit.course_service.entity.AnswerOption;
import hcmuaf.edu.vn.fit.course_service.entity.CourseCLO;
import hcmuaf.edu.vn.fit.course_service.entity.Question;
import hcmuaf.edu.vn.fit.course_service.entity.enums.Difficulty; // Giả định bạn đặt Enum ở đây
import hcmuaf.edu.vn.fit.course_service.entity.enums.QuestionType; // Giả định bạn đặt Enum ở đây
import hcmuaf.edu.vn.fit.course_service.repository.CourseCLORepository;
import hcmuaf.edu.vn.fit.course_service.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final CourseCLORepository courseCLORepository;

    /**
     * Lấy danh sách câu hỏi theo ID môn học
     */
    public List<Question> getQuestionsByCourseId(String courseId) {
        return questionRepository.findByCourseId(courseId);
    }

    /**
     * Tạo mới một câu hỏi kèm theo đáp án và map CLO
     */
    @Transactional
    public Question createQuestion(String courseId, QuestionRequest request) {
        // 1. Khởi tạo đối tượng Question
        Question question = Question.builder()
                .content(request.getContent())
                // Lưu ý: Cần import Enum QuestionType và Difficulty tương ứng
                .type(QuestionType.valueOf(request.getType().toUpperCase()))
                .difficulty(Difficulty.valueOf(request.getDifficulty().toUpperCase()))
                .courseId(courseId)
                .build();


        if (request.getOptions() != null && !request.getOptions().isEmpty()) {
            request.getOptions().forEach(optReq -> {
                AnswerOption option = AnswerOption.builder()
                        .content(optReq.getContent())
                        .isCorrect(optReq.isCorrect())
                        .build();
                question.addOption(option); // addOption đã thiết lập sẵn ở Entity
            });
        }


        if (request.getCloIds() != null && !request.getCloIds().isEmpty()) {
            List<CourseCLO> clos = courseCLORepository.findAllById(request.getCloIds());
            question.setClos(clos);
        }

        // 4. Lưu vào Database
        return questionRepository.save(question);
    }

    /**
     * Xóa câu hỏi (Sẽ cascade xóa luôn các AnswerOption liên quan)
     */
    @Transactional
    public void deleteQuestion(String id) {
        if (!questionRepository.existsById(id)) {
            throw new RuntimeException("Question not found with id: " + id);
        }
        questionRepository.deleteById(id);
    }
    @Transactional
    public List<Question> importQuestionsFromExcel(String courseId, MultipartFile file) {
        List<Question> questions = new ArrayList<>();

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0); // Lấy sheet đầu tiên
            Iterator<Row> rows = sheet.iterator();

            int rowNumber = 0;
            while (rows.hasNext()) {
                Row currentRow = rows.next();
                // Bỏ qua dòng tiêu đề (header)
                if (rowNumber == 0) {
                    rowNumber++;
                    continue;
                }

                // Đọc dữ liệu từ các cột
                String content = currentRow.getCell(1).getStringCellValue();
                String typeStr = currentRow.getCell(2).getStringCellValue();
                String difficultyStr = currentRow.getCell(3).getStringCellValue();

                Question question = Question.builder()
                        .content(content)
                        .type(QuestionType.valueOf(typeStr.toUpperCase()))
                        .difficulty(Difficulty.valueOf(difficultyStr.toUpperCase()))
                        .courseId(courseId)
                        .build();

                // Nếu là câu hỏi trắc nghiệm, đọc các đáp án A, B, C, D (cột 5,6,7,8)
                if (question.getType() == QuestionType.MULTIPLE_CHOICE) {
                    String correctAnswer = currentRow.getCell(9).getStringCellValue().trim(); // A, B, C hoặc D

                    String[] optionLabels = {"A", "B", "C", "D"};
                    for (int i = 0; i < 4; i++) {
                        Cell optionCell = currentRow.getCell(5 + i);
                        if (optionCell != null) {
                            String optContent = optionCell.getStringCellValue();
                            boolean isCorrect = optionLabels[i].equalsIgnoreCase(correctAnswer);

                            question.addOption(AnswerOption.builder()
                                    .content(optContent)
                                    .isCorrect(isCorrect)
                                    .build());
                        }
                    }
                }

                // (Tuỳ chọn) Bạn có thể viết thêm logic đọc cột CLO (cột 4) để query DB và map CourseCLO tương ứng
                // ...

                questions.add(question);
            }


            return questionRepository.saveAll(questions);

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi đọc file Excel: " + e.getMessage());
        }
    }
}