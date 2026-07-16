package hcmuaf.edu.vn.fit.course_service.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import hcmuaf.edu.vn.fit.course_service.dto.request.SubmitStudentExamRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.StudentExamResultResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.SubmitStudentExamResponse;
import hcmuaf.edu.vn.fit.course_service.entity.*;
import hcmuaf.edu.vn.fit.course_service.entity.enums.StudentExamStatus;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.SubmissionRepository;
import hcmuaf.edu.vn.fit.course_service.repository.mongo.AssessmentPaperRepository;
import hcmuaf.edu.vn.fit.course_service.repository.mongo.QuestionRepository;
import hcmuaf.edu.vn.fit.course_service.repository.mongo.StudentExamAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentExamService {

    private final StudentExamAssignmentRepository assignmentRepository;
    private final AssessmentPaperRepository assessmentPaperRepository;
    private final SubmissionRepository submissionRepository;
    private final QuestionRepository questionRepository;

    // TODO: Inject repository/service chứa đề thi + câu hỏi + đáp án đúng thật sự trong hệ thống của bạn
    // private final AssessmentPaperRepository assessmentPaperRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public SubmitStudentExamResponse submitExam(String studentId, SubmitStudentExamRequest request) {

        StudentExamAssignment assignment = assignmentRepository
                .findByAssessmentPaperIdAndStudentId(request.getExamId(), studentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài thi hoặc bạn không có quyền nộp."));



        System.out.println("Dữ Liệu Gửi vào"+request);
        System.out.println(assignment);
        if (assignment.getStatus() == StudentExamStatus.SUBMITTED || assignment.getStatus() == StudentExamStatus.GRADED) {
            throw new RuntimeException("Bạn đã nộp bài thi này rồi.");
        }

        SubmissionEntity submission = new SubmissionEntity();
        submission.setAssessmentId(request.getExamId());

        submission.setStudentId(studentId);


        String answersJson = convertAnswersToJson(request.getAnswers());
        submission.setSubmittedLink(answersJson);


        submission.setSubmittedAt(parseSubmittedAt(request.getSubmittedAt()));


        AutoGradeResult gradeResult = autoGrade(request.getExamId(), request.getAnswers());

        submission.setGradeCore(gradeResult.totalScore);
        submission.setStatus(gradeResult.allAutoGradable ? "GRADED" : "SUBMITTED");

        submissionRepository.save(submission);

        // 4) Cập nhật assignment status
        assignment.setStatus(gradeResult.allAutoGradable ? StudentExamStatus.GRADED : StudentExamStatus.SUBMITTED);
        assignmentRepository.save(assignment);

        return SubmitStudentExamResponse.builder()
                .submissionId(submission.getId())
                .examId(request.getExamId())
                .gradedScore(gradeResult.totalScore)
                .status(submission.getStatus())
                .message(gradeResult.allAutoGradable
                        ? "Nộp bài và chấm tự động thành công"
                        : "Nộp bài thành công. Bài có câu tự luận cần giảng viên chấm")
                .build();
    }


    private AutoGradeResult autoGrade(String examId, Object rawAnswers) {
        AssessmentPaper exam = assessmentPaperRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài thi hoặc bạn không có quyền nộp."));

        List<String> questionIds = exam.getQuestionIds();
        if (questionIds == null || questionIds.isEmpty()) {
            return new AutoGradeResult(0.0, true);
        }

        // 1) Load toàn bộ câu hỏi theo ids
        List<Question> questions = questionRepository.findAllById(questionIds);

        // 2) Build map dữ liệu chấm điểm
        Map<String, Integer> correctMcqByQuestionId = new HashMap<>();
        Map<String, String> typeByQuestionId = new HashMap<>();
        Map<String, Double> pointsByQuestionId = new HashMap<>();

        // 2.1) Tính totalWeight giống AssessmentPaperService
        double totalWeight = 0.0;
        for (Question q : questions) {
            if (q == null || q.getId() == null) continue;

            String type = q.getType() == null ? "UNKNOWN" : q.getType().name();
            typeByQuestionId.put(q.getId(), type);

            // MULTIPLE_CHOICE:
            if ("MULTIPLE_CHOICE".equals(type)) {
                int correctIdx = -1;
                List<AnswerOption> opts = q.getOptions();
                if (opts != null) {
                    for (int i = 0; i < opts.size(); i++) {
                        if (Boolean.TRUE.equals(opts.get(i).getCorrect())) {
                            correctIdx = i;
                            break;
                        }
                    }
                }
                if (correctIdx >= 0) correctMcqByQuestionId.put(q.getId(), correctIdx);
            }

            // Trọng số theo độ khó: EASY=1, MEDIUM=2, HARD=3
            if (q.getDifficulty() != null) {
                switch (q.getDifficulty()) {
                    case EASY -> totalWeight += 1.0;
                    case MEDIUM -> totalWeight += 2.0;
                    case HARD -> totalWeight += 3.0;
                    default -> totalWeight += 0.0;
                }
            }
        }


        if (totalWeight <= 0.0) {
            return new AutoGradeResult(0.0, true);
        }


        double baseScorePerWeight = 10.0 / totalWeight;

        // 2.3) Tính điểm từng câu theo difficulty,

        List<Question> orderedQuestions = questionIds.stream()
                .map(qid -> questions.stream()
                        .filter(q -> q != null && qid.equals(q.getId()))
                        .findFirst()
                        .orElse(null))
                .filter(Objects::nonNull)
                .toList();

        double currentTotalScore = 0.0;
        for (int i = 0; i < orderedQuestions.size(); i++) {
            Question q = orderedQuestions.get(i);

            double questionScore = 0.0;
            if (q.getDifficulty() != null) {
                switch (q.getDifficulty()) {
                    case EASY -> questionScore = Math.round(1.0 * baseScorePerWeight * 100.0) / 100.0;
                    case MEDIUM -> questionScore = Math.round(2.0 * baseScorePerWeight * 100.0) / 100.0;
                    case HARD -> questionScore = Math.round(3.0 * baseScorePerWeight * 100.0) / 100.0;
                    default -> questionScore = 0.0;
                }
            }


            if (i == orderedQuestions.size() - 1) {
                questionScore = Math.round((10.0 - currentTotalScore) * 100.0) / 100.0;
            } else {
                currentTotalScore += questionScore;
            }

            pointsByQuestionId.put(q.getId(), questionScore);
        }

        // 3) Parse answers sinh viên
        List<StudentAnswer> answers = parseAnswers(rawAnswers);
        Map<String, StudentAnswer> answerMap = answers.stream()
                .filter(a -> a.questionId != null)
                .collect(Collectors.toMap(a -> a.questionId, a -> a, (a, b) -> b));

        // 4) Tính điểm theo danh sách questionIds của đề
        double total = 0.0;
        boolean allAutoGradable = true;

        for (String qid : questionIds) {
            String type = typeByQuestionId.get(qid);
            double qPoints = pointsByQuestionId.getOrDefault(qid, 0.0);
            StudentAnswer a = answerMap.get(qid);

            if ("MULTIPLE_CHOICE".equals(type)) {
                Integer correctIndex = correctMcqByQuestionId.get(qid);
                if (a != null && a.selectedOptionIndex != null && correctIndex != null
                        && correctIndex.equals(a.selectedOptionIndex)) {
                    total += qPoints;
                }
            } else {
                // Có tự luận thì chưa thể auto-grade hoàn toàn
                allAutoGradable = false;
            }
        }

        total = Math.round(total * 100.0) / 100.0;
        return new AutoGradeResult(total, allAutoGradable);
    }
    private List<StudentAnswer> parseAnswers(Object rawAnswers) {
        try {
            return objectMapper.convertValue(rawAnswers, new TypeReference<List<StudentAnswer>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private LocalDateTime parseSubmittedAt(Object submittedAtRaw) {
        if (submittedAtRaw == null) return LocalDateTime.now();

        try {
            if (submittedAtRaw instanceof String s) {

                Instant instant = Instant.parse(s);
                return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
            }
            if (submittedAtRaw instanceof OffsetDateTime odt) {
                return odt.toLocalDateTime();
            }
            if (submittedAtRaw instanceof LocalDateTime ldt) {
                return ldt;
            }
        } catch (Exception ignored) { }

        return LocalDateTime.now();
    }
    public StudentExamResultResponse getExamResult(String userId, String examId) {
        // 1) Validate assignment (đúng user + đúng đề)
        StudentExamAssignment assignment = assignmentRepository
                .findByAssessmentPaperIdAndStudentId(examId, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài thi hoặc bạn không có quyền xem kết quả."));

        // 2) Lấy đề thi
        AssessmentPaper exam = assessmentPaperRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đề thi."));

        List<String> questionIds = exam.getQuestionIds() == null ? Collections.emptyList() : exam.getQuestionIds();
        List<Question> questions = questionIds.isEmpty()
                ? Collections.emptyList()
                : questionRepository.findAllById(questionIds);

        // map question theo id để giữ đúng thứ tự questionIds
        Map<String, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, Function.identity(), (a, b) -> a));

        // 2.1) Tính điểm từng câu theo trọng số giống AssessmentPaperService
        // EASY=1, MEDIUM=2, HARD=3; tổng = 10
        List<Question> orderedQuestions = questionIds.stream()
                .map(questionMap::get)
                .filter(Objects::nonNull)
                .toList();

        double totalWeight = 0.0;
        for (Question q : orderedQuestions) {
            if (q.getDifficulty() == null) continue;
            switch (q.getDifficulty()) {
                case EASY -> totalWeight += 1.0;
                case MEDIUM -> totalWeight += 2.0;
                case HARD -> totalWeight += 3.0;
                default -> totalWeight += 0.0;
            }
        }

        Map<String, Double> weightedPointsByQuestionId = new HashMap<>();
        if (totalWeight > 0.0 && !orderedQuestions.isEmpty()) {
            double baseScorePerWeight = 10.0 / totalWeight;
            double currentTotalScore = 0.0;

            for (int i = 0; i < orderedQuestions.size(); i++) {
                Question q = orderedQuestions.get(i);
                double questionScore = 0.0;

                if (q.getDifficulty() != null) {
                    switch (q.getDifficulty()) {
                        case EASY -> questionScore = Math.round(1.0 * baseScorePerWeight * 100.0) / 100.0;
                        case MEDIUM -> questionScore = Math.round(2.0 * baseScorePerWeight * 100.0) / 100.0;
                        case HARD -> questionScore = Math.round(3.0 * baseScorePerWeight * 100.0) / 100.0;
                        default -> questionScore = 0.0;
                    }
                }

                // Chốt câu cuối để tổng đúng 10.00
                if (i == orderedQuestions.size() - 1) {
                    questionScore = Math.round((10.0 - currentTotalScore) * 100.0) / 100.0;
                } else {
                    currentTotalScore += questionScore;
                }

                weightedPointsByQuestionId.put(q.getId(), questionScore);
            }
        }

        // 3) Lấy submission mới nhất của user cho exam
        SubmissionEntity submission = submissionRepository
                .findTopByAssessmentIdAndStudentIdOrderBySubmittedAtDesc(examId, userId)
                .orElseThrow(() -> new RuntimeException("Chưa có bài nộp cho đề thi này."));

        // 4) Parse answers sinh viên từ JSON submittedLink
        List<StudentAnswer> studentAnswers = parseAnswersFromJson(submission.getSubmittedLink());
        Map<String, StudentAnswer> answerMap = studentAnswers.stream()
                .filter(a -> a.questionId != null)
                .collect(Collectors.toMap(a -> a.questionId, a -> a, (a, b) -> b));

        // 5) Build details + tính điểm
        List<StudentExamResultResponse.QuestionResult> details = new ArrayList<>();
        double totalPoints = 0.0;
        double score = 0.0;
        int correctQuestions = 0;

        for (String qid : questionIds) {
            Question q = questionMap.get(qid);
            if (q == null) continue;

            double maxPoint = weightedPointsByQuestionId.getOrDefault(qid, 0.0);
            totalPoints += maxPoint;

            StudentAnswer sa = answerMap.get(qid);

            StudentExamResultResponse.QuestionResult qr = new StudentExamResultResponse.QuestionResult();
            qr.setId(q.getId());
            qr.setContent(q.getContent());
            qr.setType(q.getType() == null ? "UNKNOWN" : q.getType().name());
            qr.setMaxPoints(maxPoint);

            // map options cho UI (MCQ)
            if (q.getOptions() != null) {
                List<StudentExamResultResponse.OptionDto> optDtos = new ArrayList<>();
                for (AnswerOption opt : q.getOptions()) {
                    StudentExamResultResponse.OptionDto o = new StudentExamResultResponse.OptionDto();
                    o.setContent(opt.getContent());
                    o.setCorrect(Boolean.TRUE.equals(opt.getCorrect()));
                    optDtos.add(o);
                }
                qr.setOptions(optDtos);
            }

            boolean isCorrect = false;
            double earned = 0.0;

            // MULTIPLE_CHOICE: auto-check theo selectedOptionIndex
            if (q.getType() != null && "MULTIPLE_CHOICE".equals(q.getType().name())) {
                Integer correctIdx = findCorrectOptionIndex(q.getOptions());

                if (sa != null) {
                    qr.setStudentAnswer(sa.selectedOptionIndex != null ? sa.selectedOptionIndex : sa.textAnswer);
                } else {
                    qr.setStudentAnswer(null);
                }

                if (correctIdx != null) {
                    qr.setCorrectAnswer(String.valueOf(correctIdx));
                }

                if (sa != null && sa.selectedOptionIndex != null && correctIdx != null
                        && correctIdx.equals(sa.selectedOptionIndex)) {
                    isCorrect = true;
                    earned = maxPoint;
                }
            } else {
                // ESSAY / SHORT_ANSWER
                qr.setStudentAnswer(sa != null ? sa.textAnswer : null);
                qr.setCorrectAnswer(null);
                isCorrect = false;
                earned = 0.0;
            }

            qr.setCorrect(isCorrect);
            qr.setPoints(earned);

            if (isCorrect) correctQuestions++;
            score += earned;

            details.add(qr);
        }

        // làm tròn hiển thị
        totalPoints = Math.round(totalPoints * 100.0) / 100.0;
        score = Math.round(score * 100.0) / 100.0;

        // Nếu DB đã có gradeCore thì ưu tiên dùng để phản ánh đúng chấm thực tế
        if (submission.getGradeCore() != null) {
            score = Math.round(submission.getGradeCore() * 100.0) / 100.0;
        }

        StudentExamResultResponse res = new StudentExamResultResponse();
        res.setExamTitle(exam.getExamTitle() == null ? "Bài thi" : exam.getExamTitle());
        res.setScore(score);
        res.setTotalPoints(totalPoints); // thường sẽ là 10.00 nếu có câu hỏi hợp lệ
        res.setTotalQuestions(details.size());
        res.setCorrectQuestions(correctQuestions);
        res.setDetails(details);

        return res;
    }

    private Integer findCorrectOptionIndex(List<AnswerOption> options) {
        if (options == null) return null;
        for (int i = 0; i < options.size(); i++) {
            if (Boolean.TRUE.equals(options.get(i).getCorrect())) return i;
        }
        return null;
    }

    private List<StudentAnswer> parseAnswersFromJson(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<StudentAnswer>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
    private String convertAnswersToJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "[]";
        }
    }

    private static class AutoGradeResult {
        double totalScore;
        boolean allAutoGradable;
        AutoGradeResult(double totalScore, boolean allAutoGradable) {
            this.totalScore = totalScore;
            this.allAutoGradable = allAutoGradable;
        }
    }

    private static class StudentAnswer {
        public String questionId;
        public String type; 
        public Integer selectedOptionIndex;
        public String textAnswer;
    }
}