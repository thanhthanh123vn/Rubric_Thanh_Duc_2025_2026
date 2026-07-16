package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.request.QuestionRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.OfferingQuestionCount;
import hcmuaf.edu.vn.fit.course_service.dto.response.QuestionResponse;
import hcmuaf.edu.vn.fit.course_service.entity.*;
import hcmuaf.edu.vn.fit.course_service.entity.enums.Difficulty;
import hcmuaf.edu.vn.fit.course_service.entity.enums.QuestionType;
import hcmuaf.edu.vn.fit.course_service.mapper.QuestionMapper;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseCLORepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.mongo.QuestionBankRepository;
import hcmuaf.edu.vn.fit.course_service.repository.mongo.QuestionRepository;
// import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseOfferingRepository; // Import thêm cái này nếu cần lấy Course
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
    private final QuestionMapper questionMapper;


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
                .score(request.getScore() != null ? request.getScore() : 1.0)
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


    public List<Question> importQuestionsFromExcel(String offeringId, String bankId, MultipartFile file) {

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

                String typeStr = dataFormatter.formatCellValue(currentRow.getCell(2)).trim();
                String difficultyStr = dataFormatter.formatCellValue(currentRow.getCell(3)).trim();

                Cell scoreCell = currentRow.getCell(10);
                Double score = 1.0;
                if (scoreCell != null) {
                    try {
                        score = Double.parseDouble(dataFormatter.formatCellValue(scoreCell).trim());
                    } catch (NumberFormatException e) {
                        score = 1.0;
                    }
                }

                Question question = Question.builder()
                        .content(content)
                        .type(QuestionType.valueOf(typeStr.toUpperCase()))
                        .difficulty(Difficulty.valueOf(difficultyStr.toUpperCase()))
                        .score(score)
                        .offeringId(offeringId)
                        .options(new ArrayList<>())
                        .build();


                String cloCodesStr = dataFormatter.formatCellValue(currentRow.getCell(9)).trim();
                if (!cloCodesStr.isEmpty()) {
                    List<String> cloCodes = Arrays.stream(cloCodesStr.split(","))
                            .map(String::trim)
                            .map(String::toUpperCase)
                            .filter(s -> !s.isEmpty())
                            .toList();

                    if (!cloCodes.isEmpty()) {
                        List<CourseCLO> mappedCLOs =
                                courseCLORepository.findByCloCodeIn(cloCodes);

                        List<String> cloIds = mappedCLOs.stream()
                                .map(CourseCLO::getCloId)
                                .toList();

                        question.setCloIds(cloIds);
                    }
                }


                if (question.getType() == QuestionType.MULTIPLE_CHOICE) {
                    String correctAnswer = dataFormatter.formatCellValue(currentRow.getCell(8))
                            .trim().toUpperCase();
                    String[] optionLabels = {"A", "B", "C", "D"};


                    for (int i = 0; i < 4; i++) {
                        String optContent = dataFormatter.formatCellValue(currentRow.getCell(4+ i)).trim();
                        if (!optContent.isEmpty()) {
                            boolean correct = optContent.equalsIgnoreCase(correctAnswer);

                            question.getOptions().add(
                                    AnswerOption.builder()
                                            .content(optContent)
                                            .correct(correct)
                                            .build()
                            );
                        }
                    }
                }

                question.setOfferingId(offeringId);
                questions.add(question);
                rowNumber++;
            }

            // 1. Lưu toàn bộ câu hỏi vào Database
            List<Question> savedQuestions = questionRepository.saveAll(questions);

            // 2. Chèn thông tin ID các câu hỏi này xuống QuestionBank
            if (bankId != null && !bankId.isEmpty()) {
                QuestionBank bank = questionBankRepository.findByIdAndOfferingId(bankId, offeringId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy Question Bank"));

                if (bank.getQuestionIds() == null) {
                    bank.setQuestionIds(new ArrayList<>());
                }

                List<String> savedQuestionIds = savedQuestions.stream()
                        .map(Question::getId)
                        .collect(Collectors.toList());

                bank.getQuestionIds().addAll(savedQuestionIds);
                questionBankRepository.save(bank);
            }

            return savedQuestions;

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
        if (request.getScore() != null) {
            question.setScore(request.getScore());
        }

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
                        bankId,
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
    public List<QuestionResponse> getAllQuestionsOfCourse(String offeringId) {
        Optional<CourseOffering> courseOfferingOpt = courseOfferingRepository.findById(offeringId);
        if (courseOfferingOpt.isEmpty() || courseOfferingOpt.get().getCourse() == null) {
            return Collections.emptyList();
        }

        String courseId = courseOfferingOpt.get().getCourse().getCourseId();
        List<CourseOffering> allOfferings = courseOfferingRepository.findByCourse_CourseIdIn(Set.of(courseId));
        Set<String> allOfferingIds = allOfferings.stream()
                .map(CourseOffering::getOfferingId)
                .collect(Collectors.toSet());

        List<Question> questions = questionRepository.findAllByOfferingIdIn(allOfferingIds);

        return questions.stream()
                .map(questionMapper::mapToResponse)
                .collect(Collectors.toList());
    }
}
