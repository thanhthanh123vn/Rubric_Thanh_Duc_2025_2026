package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.request.QuestionRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.OfferingQuestionCount;
import hcmuaf.edu.vn.fit.course_service.entity.*;
import hcmuaf.edu.vn.fit.course_service.entity.enums.Difficulty;
import hcmuaf.edu.vn.fit.course_service.entity.enums.QuestionType;
import hcmuaf.edu.vn.fit.course_service.repository.CourseCLORepository;
import hcmuaf.edu.vn.fit.course_service.repository.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.QuestionBankRepository;
import hcmuaf.edu.vn.fit.course_service.repository.QuestionRepository;
// import hcmuaf.edu.vn.fit.course_service.repository.CourseOfferingRepository; // Import thêm cái này nếu cần lấy Course
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final CourseCLORepository courseCLORepository;
    private final QuestionBankRepository questionBankRepository;


    private final CourseOfferingRepository courseOfferingRepository;

    /**
     * Lấy danh sách câu hỏi theo ID học phần (Offering)
     */
    public List<Question> getQuestionsByOfferingId(String offeringId) {
        return questionRepository.findByOfferingId(offeringId);
    }

    /**
     * Tạo mới một câu hỏi kèm theo đáp án và map CLO
     */
    @Transactional
    public Question createQuestion(String offeringId, QuestionRequest request) {

        Question question = Question.builder()
                .content(request.getContent())
                .type(QuestionType.valueOf(request.getType().toUpperCase()))
                .difficulty(Difficulty.valueOf(request.getDifficulty().toUpperCase()))
                .offeringId(offeringId)
                .build();

        if (request.getOptions() != null && !request.getOptions().isEmpty()) {

            List<AnswerOption> options = request.getOptions()
                    .stream()
                    .map(optReq -> AnswerOption.builder()
                            .content(optReq.getContent())
                            .correct(optReq.isCorrect())
                            .build())
                    .toList();

            question.setOptions(options);
        }

        if (request.getCloIds() != null) {
            question.setCloIds(request.getCloIds());
        }

        return questionRepository.save(question);
    }

    @Transactional
    public Question createQuestionToBank(String offeringId, String bankId, QuestionRequest request) {
        QuestionBank bank = questionBankRepository
                .findByIdAndOfferingId(bankId, offeringId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Question Bank"));

        Question savedQuestion = createQuestion(offeringId, request);

        if (bank.getQuestionIds() == null) {
            bank.setQuestionIds(new ArrayList<>());
        }

        bank.getQuestionIds().add(savedQuestion.getId());
        questionBankRepository.save(bank);

        return savedQuestion;
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
    public void deleteQuestionFromBank(String bankId, String questionId) {
        QuestionBank bank = questionBankRepository
                .findById(bankId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Question Bank"));

        if (bank.getQuestionIds() != null) {
            bank.setQuestionIds(
                    bank.getQuestionIds().stream()
                            .filter(id -> !Objects.equals(id, questionId))
                            .collect(Collectors.toList())
            );
            questionBankRepository.save(bank);
        }

        if (questionRepository.existsById(questionId)) {
            questionRepository.deleteById(questionId);
        }
    }


    /**
     * Import câu hỏi từ file Excel
     */




    @Transactional

    public List<Question> importQuestionsFromExcel(String offeringId, MultipartFile file) {

        List<Question> questions = new ArrayList<>();
        CourseOffering offering = courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Học phần"));


        String actualCourseId = offering.getCourse().getCourseId();

        Set<String> existingQuestions = questionRepository.findByOfferingId(offeringId)
                .stream()
                .map(q -> q.getContent().trim().toLowerCase())
                .collect(Collectors.toSet());

        DataFormatter dataFormatter = new DataFormatter();


        int rowNumber = 0;

        try (InputStream is = file.getInputStream();

             Workbook workbook = new XSSFWorkbook(is)) {


            Sheet sheet = workbook.getSheetAt(0);

            Iterator<Row> rows = sheet.iterator();


            rowNumber = 0;

            while (rows.hasNext()) {

                Row currentRow = rows.next();

                // Bỏ qua dòng tiêu đề (header)

                if (rowNumber == 0) {

                    rowNumber++;

                    continue;

                }


                // Kiểm tra dòng trống (nếu cột Nội dung trống thì bỏ qua)

                Cell contentCell = currentRow.getCell(1);

                if (contentCell == null || dataFormatter.formatCellValue(contentCell).trim().isEmpty()) {

                    continue;

                }


                    // Đọc dữ liệu cơ bản

                String content = dataFormatter.formatCellValue(contentCell).trim();



                if (questionRepository.existsByContentAndOfferingId(content, offeringId)) {
                    rowNumber++;
                    continue;
                }
                String typeStr = dataFormatter.formatCellValue(currentRow.getCell(2));

                String difficultyStr = dataFormatter.formatCellValue(currentRow.getCell(3));


                Question question = Question.builder()

                        .content(content)

                        .type(QuestionType.valueOf(typeStr.toUpperCase()))

                        .difficulty(Difficulty.valueOf(difficultyStr.toUpperCase()))

                        .offeringId(offeringId)

                        .build();



                // [MỚI Thêm] LOGIC ĐỌC VÀ MAP CLO (CỘT E - INDEX 4)



                Cell cloCell = currentRow.getCell(4);
                String cloCodesStr = dataFormatter.formatCellValue(cloCell).trim();

                if (cloCodesStr != null && !cloCodesStr.trim().isEmpty()) {

                    List<String> cloCodes = Arrays.stream(cloCodesStr.split(","))
                            .map(String::trim)
                            .map(String::toLowerCase)
                            .filter(s -> !s.isEmpty())
                            .collect(Collectors.toList());

                    if (!cloCodes.isEmpty()) {








                            List<CourseCLO> mappedCLOs = courseCLORepository.findByCourseIdAndCloCodesIgnoreCase(actualCourseId, cloCodes);
                            System.out.println("CLO Codes từ Excel: " + cloCodes);
                            System.out.println("Mapped CLOs size: " + mappedCLOs.size());
                            mappedCLOs.forEach(c -> System.out.println(c.getCloId()));
                        List<String> cloIds = mappedCLOs.stream()
                                .map(CourseCLO::getCloId)
                                .toList();

                        question.setCloIds(cloIds);

                    }
                }




                    // Đọc các đáp án A, B, C, D (Nếu là câu hỏi trắc nghiệm)

                if (question.getType() == QuestionType.MULTIPLE_CHOICE) {

                    String correctAnswer = dataFormatter.formatCellValue(currentRow.getCell(9)).trim();


                    String[] optionLabels = {"A", "B", "C", "D"};

                    for (int i = 0; i < 4; i++) {

                        Cell optionCell = currentRow.getCell(5 + i);

                        if (optionCell != null) {

                            String optContent = dataFormatter.formatCellValue(optionCell);

                            if (!optContent.trim().isEmpty()) {

                                boolean isCorrect = optionLabels[i].equalsIgnoreCase(correctAnswer);


                                question.getOptions().add(
                                        AnswerOption.builder()
                                                .content(optContent)
                                                .correct(isCorrect)
                                                .build()
                                );

                            }

                        }

                    }

                }

                question.setOfferingId(offeringId);

                questions.add(question);


                rowNumber++;

            }


            return questionRepository.saveAll(questions);


        } catch (Exception e) {

            throw new RuntimeException("Lỗi khi đọc file Excel tại dòng " + rowNumber + ": " + e.getMessage());

        }

    }
    @Transactional
    public Question updateQuestion(String id, QuestionRequest request) {
        // 1. Tìm câu hỏi trong Database
        System.out.println(id);
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu hỏi với ID: " + id));

        // 2. Cập nhật các thông tin cơ bản
        question.setContent(request.getContent());
        question.setType(
                QuestionType.valueOf(request.getType().toUpperCase())
        );
        question.setDifficulty(
                Difficulty.valueOf(request.getDifficulty().toUpperCase())
        );

        List<AnswerOption> options = new ArrayList<>();

        if (request.getOptions() != null) {
            options = request.getOptions()
                    .stream()
                    .map(optReq -> AnswerOption.builder()
                            .content(optReq.getContent())
                            .correct(optReq.isCorrect())
                            .build())
                    .toList();
        }

        question.setOptions(options);

        if (request.getCloIds() != null) {
            question.setCloIds(request.getCloIds());
        }

        return questionRepository.save(question);
    }
    public long getQuestionCountByOfferingId(String offeringId) {
        return questionRepository.countByOfferingId(offeringId);
    }

    /**
     * Lấy số lượng câu hỏi của nhiều học phần cùng lúc (Trả về Map<offeringId, count>)
     */
    public Map<String, Long> getQuestionCountsForOfferings(List<String> offeringIds) {

        if (offeringIds == null || offeringIds.isEmpty()) {
            return new HashMap<>();
        }

        List<OfferingQuestionCount> results =
                questionRepository.countQuestionsByOfferingIds(offeringIds);

        Map<String, Long> countMap = new HashMap<>();


        for (String id : offeringIds) {
            countMap.put(id, 0L);
        }


        for (OfferingQuestionCount result : results) {

            String offeringId = result.getId();

            Long count = result.getCount();

            countMap.put(offeringId, count);
        }

        return countMap;
    }
    public List<Question> getQuestionsByBankId(
            String offeringId,
            String bankId
    ) {

        QuestionBank bank = questionBankRepository
                .findById(bankId)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy ngân hàng câu hỏi"));

        // Kiểm tra kho thuộc đúng học phần
        if (!offeringId.equals(bank.getOfferingId())) {
            throw new RuntimeException(
                    "Question bank không thuộc học phần này"
            );
        }

        if (bank.getQuestionIds() == null
                || bank.getQuestionIds().isEmpty()) {
            return Collections.emptyList();
        }

        return questionRepository.findAllById(
                bank.getQuestionIds()
        );
    }

    public List<Question> getQuestionsByBankId(String bankId) {
        QuestionBank bank = questionBankRepository
                .findById(bankId)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy ngân hàng câu hỏi"));

        if (bank.getQuestionIds() == null || bank.getQuestionIds().isEmpty()) {
            return Collections.emptyList();
        }

        return questionRepository.findAllById(bank.getQuestionIds());
    }
    @Transactional
    public List<Question> importQuestionsToBank(
            String offeringId,
            String bankId,
            MultipartFile file
    ) {

       QuestionBank bank = questionBankRepository
                .findByIdAndOfferingId(bankId, offeringId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy Question Bank"
                        ));

        List<Question> questions =
                importQuestionsFromExcel(
                        offeringId,
                        file
                );

        List<String> questionIds =
                questions.stream()
                        .map(Question::getId)
                        .toList();

        if (bank.getQuestionIds() == null) {
            bank.setQuestionIds(new ArrayList<>());
        }

        bank.getQuestionIds().addAll(questionIds);

        questionBankRepository.save(bank);

        return questions;
    }
    public long countQuestionsInBank(
            String offeringId,
            String bankId
    ) {

        QuestionBank bank = questionBankRepository
                .findById(bankId)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy Question Bank"));

        return Optional.ofNullable(bank.getQuestionIds())
                .map(List::size)
                .orElse(0);
    }
}
