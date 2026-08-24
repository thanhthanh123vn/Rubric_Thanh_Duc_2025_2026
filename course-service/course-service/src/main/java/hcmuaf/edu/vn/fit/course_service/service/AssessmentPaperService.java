package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.NotificationClient;
import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.GenerateExamRequest;
import hcmuaf.edu.vn.fit.course_service.dto.request.NotificationRequest;
import hcmuaf.edu.vn.fit.course_service.dto.request.UpdateAssessmentPaperRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.*;
import hcmuaf.edu.vn.fit.course_service.entity.*;
import hcmuaf.edu.vn.fit.course_service.entity.enums.Difficulty;
import hcmuaf.edu.vn.fit.course_service.entity.enums.QuestionType;
import hcmuaf.edu.vn.fit.course_service.entity.enums.StudentExamStatus;
import hcmuaf.edu.vn.fit.course_service.exception.BadRequestException;
import hcmuaf.edu.vn.fit.course_service.exception.ResourceNotFoundException;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.EnrollmentRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.SubmissionRepository;
import hcmuaf.edu.vn.fit.course_service.repository.mongo.AssessmentPaperRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.AssessmentRepository;
import hcmuaf.edu.vn.fit.course_service.repository.mongo.QuestionRepository;
import hcmuaf.edu.vn.fit.course_service.repository.mongo.QuestionBankRepository;
import hcmuaf.edu.vn.fit.course_service.repository.mongo.StudentExamAssignmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j

public class AssessmentPaperService {

    private final QuestionRepository questionRepository;
    private final QuestionBankRepository questionBankRepository;
    private final UserClient userClient;
    private final AssessmentRepository assessmentRepository;
    private final NotificationClient notificationClient;
    private final AssessmentPaperRepository assessmentPaperRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentExamAssignmentRepository studentExamAssignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final StringRedisTemplate redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    public List<ExamQuestionDetailResponse> generateExamQuestions(String userId, GenerateExamRequest request) {
        if (userId == null || userId.isBlank()) {
            throw new BadRequestException("Thiếu thông tin giảng viên");
        }
        if (request.getOfferingId() == null || request.getOfferingId().isBlank()) {
            throw new BadRequestException("Lớp học phần không hợp lệ");
        }
        if (request.getQuestionBankId() == null || request.getQuestionBankId().isBlank()) {
            throw new BadRequestException("Vui lòng chọn kho câu hỏi");
        }
        if (request.getEasyCount() < 0 || request.getMediumCount() < 0 || request.getHardCount() < 0) {
            throw new BadRequestException("Số lượng câu hỏi không được âm");
        }
        if (request.getExamTitle() == null || request.getExamTitle().trim().isEmpty()) {
            throw new BadRequestException("Tên đề thi không được để trống!");
        }
        if (request.getDurationMinutes() == null || request.getDurationMinutes() <= 0) {
            throw new BadRequestException("Thời lượng làm bài phải lớn hơn 0 phút!");
        }
        if (request.getStartTime() == null || request.getEndTime() == null
                || !request.getEndTime().isAfter(request.getStartTime())) {
            throw new BadRequestException("Thời gian kết thúc phải sau thời gian bắt đầu!");
        }
        long availableMinutes = Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
        if (request.getDurationMinutes() > availableMinutes) {
            throw new BadRequestException("Thời lượng làm bài không được lớn hơn khoảng thời gian mở đề");
        }

        courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học phần"));
        LecturerResponse lecturer = userClient.getLecturerByUserId(userId);
        QuestionBank bank = questionBankRepository
                .findByIdAndOfferingId(request.getQuestionBankId(), request.getOfferingId())
                .orElseThrow(() -> new ResourceNotFoundException("Kho câu hỏi không thuộc lớp học phần này"));
        if (!Objects.equals(bank.getLecturerId(), lecturer.getLecturerId()) && !Boolean.TRUE.equals(bank.getIsPublic())) {
            throw new BadRequestException("Bạn không có quyền sử dụng kho câu hỏi này");
        }

        Set<String> bankQuestionIds = new HashSet<>(bank.getQuestionIds() == null ? List.of() : bank.getQuestionIds());
        Set<String> requestedCloIds = new HashSet<>(request.getCloIds() == null ? List.of() : request.getCloIds());
        List<Question> eligibleQuestions = questionRepository.findAllById(bankQuestionIds).stream()
                .filter(question -> Objects.equals(request.getOfferingId(), question.getOfferingId()))
                .filter(question -> question.getType() == QuestionType.MULTIPLE_CHOICE)
                .filter(question -> requestedCloIds.isEmpty()
                        || (question.getCloIds() != null && question.getCloIds().stream().anyMatch(requestedCloIds::contains)))
                .toList();

        List<Question> easyPool = eligibleQuestions.stream().filter(q -> q.getDifficulty() == Difficulty.EASY).collect(Collectors.toCollection(ArrayList::new));
        List<Question> mediumPool = eligibleQuestions.stream().filter(q -> q.getDifficulty() == Difficulty.MEDIUM).collect(Collectors.toCollection(ArrayList::new));
        List<Question> hardPool = eligibleQuestions.stream().filter(q -> q.getDifficulty() == Difficulty.HARD).collect(Collectors.toCollection(ArrayList::new));
        if (easyPool.size() < request.getEasyCount() || mediumPool.size() < request.getMediumCount() || hardPool.size() < request.getHardCount()) {
            throw new BadRequestException("Kho không đủ câu hỏi trắc nghiệm theo mức độ đã chọn");
        }

        Collections.shuffle(easyPool);
        Collections.shuffle(mediumPool);
        Collections.shuffle(hardPool);
        List<Question> selectedQuestions = new ArrayList<>();
        selectedQuestions.addAll(easyPool.subList(0, request.getEasyCount()));
        selectedQuestions.addAll(mediumPool.subList(0, request.getMediumCount()));
        selectedQuestions.addAll(hardPool.subList(0, request.getHardCount()));
        if (selectedQuestions.isEmpty()) {
            throw new BadRequestException("Tổng số câu hỏi trong đề phải lớn hơn 0!");
        }

        double totalWeight = request.getEasyCount() + request.getMediumCount() * 2.0 + request.getHardCount() * 3.0;
        double baseScorePerWeight = 10.0 / totalWeight;
        List<ExamQuestionDetailResponse> examQuestions = new ArrayList<>();
        double currentTotalScore = 0.0;
        for (int i = 0; i < selectedQuestions.size(); i++) {
            Question question = selectedQuestions.get(i);
            double difficultyWeight = question.getDifficulty() == Difficulty.HARD ? 3.0
                    : question.getDifficulty() == Difficulty.MEDIUM ? 2.0 : 1.0;
            double questionScore = Math.round(difficultyWeight * baseScorePerWeight * 100.0) / 100.0;
            if (i == selectedQuestions.size() - 1) {
                questionScore = Math.round((10.0 - currentTotalScore) * 100.0) / 100.0;
            } else {
                currentTotalScore += questionScore;
            }
            examQuestions.add(new ExamQuestionDetailResponse(question.getId(), question.getContent(), question.getDifficulty(), questionScore));
        }

        List<String> questionIds = selectedQuestions.stream().map(Question::getId).toList();
        String assessmentId = request.getAssessmentId();
        if (assessmentId != null && !assessmentId.isEmpty()) {

            assessmentRepository.findById(assessmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài thi!"));
        }
        AssessmentPaper assessmentPaper = AssessmentPaper.builder()
                .assessmentId(assessmentId)
                .lecturerId(lecturer.getLecturerId())
                .offeringId(request.getOfferingId())
                .sourceQuestionBankId(request.getQuestionBankId())
                .questionIds(questionIds)
                .examTitle(request.getExamTitle().trim())
                .durationMinutes(request.getDurationMinutes())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .shuffleQuestions(true)
                .status("DRAFT")
                .shuffleOptions(true)
                .build();

        assessmentPaper = assessmentPaperRepository.save(assessmentPaper);
        return examQuestions;
    }
//    public List<ExamQuestionDetailResponse> getAllExampleForLecturer(String offeringId){
//        List<ExamQuestionDetailResponse> examQuestions = questionRepository
//
//    }

    public List<AssessmentPaper> getAllByLecturer(String userId, String offeringId) {
        LecturerResponse lecturerResponse = userClient.getLecturerByUserId(userId);
        String lecturerId = lecturerResponse.getLecturerId();
        if (offeringId == null || offeringId.isBlank()) {
            return assessmentPaperRepository.findByLecturerId(lecturerId);
        }
        Map<String, AssessmentPaper> papers = new LinkedHashMap<>();
        assessmentPaperRepository.findByLecturerIdAndOfferingId(lecturerId, offeringId)
                .forEach(paper -> papers.put(paper.getId(), paper));
        assessmentPaperRepository.findByLecturerIdAndOfferingIdIsNullAndSourceQuestionBankId(lecturerId, offeringId)
                .forEach(paper -> papers.putIfAbsent(paper.getId(), paper));
        return new ArrayList<>(papers.values());
    }


    public AssessmentPaper getPaperDetail(String paperId) {
        return assessmentPaperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề thi"));
    }

    public LecturerExamDetailResponse getLecturerExamDetail(String paperId, String userId) {
        AssessmentPaper paper = assessmentPaperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề thi"));
        LecturerResponse lecturer = userClient.getLecturerByUserId(userId);
        if (lecturer == null || lecturer.getLecturerId() == null
                || !Objects.equals(paper.getLecturerId(), lecturer.getLecturerId())) {
            throw new BadRequestException("Bạn không có quyền xem kết quả của đề thi này");
        }

        CourseOffering offering = courseOfferingRepository.findById(resolveOfferingId(paper))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học phần"));

        List<String> questionIds = paper.getQuestionIds() == null ? List.of() : paper.getQuestionIds();
        Map<String, Question> questionById = questionRepository.findAllById(questionIds).stream()
                .filter(question -> question.getId() != null)
                .collect(Collectors.toMap(Question::getId, question -> question, (first, ignored) -> first));
        List<Question> orderedQuestions = questionIds.stream()
                .map(questionById::get)
                .filter(Objects::nonNull)
                .toList();

        double totalWeight = orderedQuestions.stream().mapToDouble(this::questionWeight).sum();
        double baseScore = totalWeight > 0 ? 10.0 / totalWeight : 0.0;
        double accumulatedScore = 0.0;
        List<LecturerExamDetailResponse.ExamQuestionDetailDTO> questionDetails = new ArrayList<>();
        for (int index = 0; index < orderedQuestions.size(); index++) {
            Question question = orderedQuestions.get(index);
            double points = index == orderedQuestions.size() - 1
                    ? roundScore(10.0 - accumulatedScore)
                    : roundScore(questionWeight(question) * baseScore);
            if (index < orderedQuestions.size() - 1) accumulatedScore += points;

            questionDetails.add(LecturerExamDetailResponse.ExamQuestionDetailDTO.builder()
                    .id(question.getId())
                    .content(question.getContent())
                    .type(question.getType() == null ? "UNKNOWN" : question.getType().name())
                    .options(question.getOptions())
                    .correctOptionIndex(findCorrectOptionIndexForLecturer(question.getOptions()))
                    .points(points)
                    .difficulty(question.getDifficulty() == null ? null : question.getDifficulty().name())
                    .cloCode(question.getCloIds())
                    .build());
        }

        List<StudentExamAssignment> assignments = studentExamAssignmentRepository.findByAssessmentPaperId(paperId);
        Map<String, SubmissionEntity> latestSubmissionByStudent = submissionRepository.findByAssessmentId(paperId).stream()
                .filter(submission -> submission.getStudentId() != null)
                .collect(Collectors.toMap(
                        SubmissionEntity::getStudentId,
                        submission -> submission,
                        (first, second) -> isLater(second, first) ? second : first
                ));

        List<String> studentIds = assignments.stream()
                .map(StudentExamAssignment::getStudentId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        Map<String, UserResponse> users = Collections.emptyMap();
        if (!studentIds.isEmpty()) {
            try {
                Map<String, UserResponse> loadedUsers = userClient.getUsers(studentIds);
                if (loadedUsers != null) users = loadedUsers;
            } catch (Exception exception) {
                log.warn("Không thể tải tên sinh viên cho đề thi {}", paperId, exception);
            }
        }

        Map<String, UserResponse> studentUsers = users;
        List<LecturerExamDetailResponse.StudentSubmissionRowDTO> submissionRows = assignments.stream()
                .sorted(Comparator.comparing(StudentExamAssignment::getStudentId,
                        Comparator.nullsLast(String::compareTo)))
                .map(assignment -> {
                    SubmissionEntity submission = latestSubmissionByStudent.get(assignment.getStudentId());
                    UserResponse user = studentUsers.get(assignment.getStudentId());
                    String status = assignment.getStatus() == StudentExamStatus.GRADED
                            ? "GRADED"
                            : assignment.getStatus() == StudentExamStatus.SUBMITTED ? "PENDING" : "NOT_SUBMITTED";
                    Double score = submission != null && submission.getGradeCore() != null
                            ? submission.getGradeCore() : assignment.getScore();
                    Instant submittedAt = submission != null && submission.getSubmittedAt() != null
                            ? submission.getSubmittedAt().toInstant(java.time.ZoneOffset.UTC)
                            : assignment.getSubmittedAt();

                    return LecturerExamDetailResponse.StudentSubmissionRowDTO.builder()
                            .studentId(assignment.getStudentId())
                            .studentCode(assignment.getStudentId())
                            .studentName(user != null && user.getFullName() != null
                                    ? user.getFullName() : "Sinh viên " + assignment.getStudentId())
                            .classCode(offering.getOfferingId())
                            .submitTime(submittedAt)
                            .score(score)
                            .status(status)
                            .build();
                })
                .toList();

        String courseName = offering.getCourse() != null
                ? offering.getCourse().getCourseName() : offering.getOfferingName();
        String courseCode = offering.getCourse() != null
                ? offering.getCourse().getCourseCode() : offering.getOfferingId();
        return LecturerExamDetailResponse.builder()
                .examId(paper.getId())
                .examTitle(paper.getExamTitle())
                .courseName(courseName)
                .courseCode(courseCode)
                .durationMinutes(paper.getDurationMinutes())
                .totalPoints(orderedQuestions.isEmpty() ? 0.0 : 10.0)
                .status(paper.getStatus())
                .createdAt(paper.getCreatedAt())
                .questions(questionDetails)
                .submissions(submissionRows)
                .build();
    }

    private double questionWeight(Question question) {
        if (question.getDifficulty() == Difficulty.EASY) return 1.0;
        if (question.getDifficulty() == Difficulty.HARD) return 3.0;
        return 2.0;
    }

    private double roundScore(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private Integer findCorrectOptionIndexForLecturer(List<AnswerOption> options) {
        if (options == null) return null;
        for (int index = 0; index < options.size(); index++) {
            if (Boolean.TRUE.equals(options.get(index).getCorrect())) return index;
        }
        return null;
    }

    private boolean isLater(SubmissionEntity candidate, SubmissionEntity current) {
        if (candidate.getSubmittedAt() == null) return false;
        return current.getSubmittedAt() == null || candidate.getSubmittedAt().isAfter(current.getSubmittedAt());
    }

    //    public List<AssessmentPaper> getAllByLecturer(String userId) {
//        LecturerResponse lecturerResponse = userClient.getLecturerByUserId(userId);
//        String lecturerId = lecturerResponse.getLecturerId();
//
//        return assessmentPaperRepository.findByLecturerId(lecturerId);
//    }
    @Transactional
    public void publishExam(String assessmentPaperId, String userId) {
        AssessmentPaper paper = assessmentPaperRepository.findById(assessmentPaperId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề thi với ID: " + assessmentPaperId));

        LecturerResponse lecturer = userClient.getLecturerByUserId(userId);
        if (!Objects.equals(paper.getLecturerId(), lecturer.getLecturerId())) {
            throw new BadRequestException("Bạn không có quyền giao đề thi này");
        }

        if ("PUBLISHED".equalsIgnoreCase(paper.getStatus())) {
            throw new BadRequestException("Đề thi đã được giao trước đó");
        }
        if (paper.getQuestionIds() == null || paper.getQuestionIds().isEmpty()) {
            throw new BadRequestException("Đề thi chưa có câu hỏi");
        }
        if (paper.getStartTime() == null || paper.getEndTime() == null || paper.getDurationMinutes() == null) {
            throw new BadRequestException("Đề thi chưa có đủ cấu hình thời gian");
        }
        if (!paper.getEndTime().isAfter(Instant.now())) {
            throw new BadRequestException("Không thể giao đề đã hết thời gian làm bài");
        }
        if (paper.getDurationMinutes() <= 0
                || paper.getDurationMinutes() > Duration.between(paper.getStartTime(), paper.getEndTime()).toMinutes()) {
            throw new BadRequestException("Thời lượng làm bài không hợp lệ");
        }

        String offeringId = resolveOfferingId(paper);
        List<StudentCourseProjection> students = enrollmentRepository.findStudentsByOfferingId(offeringId);
        if (students.isEmpty()) {
            throw new BadRequestException("Lớp học phần chưa có sinh viên để giao đề");
        }

        List<StudentExamAssignment> assignments = new ArrayList<>();

        for (StudentCourseProjection student : students) {
            boolean existed = studentExamAssignmentRepository
                    .existsByAssessmentPaperIdAndStudentId(paper.getId(), student.getId());

            if (!existed) {
                StudentExamAssignment assignment = StudentExamAssignment.builder()
                        .assessmentPaperId(paper.getId())
                        .studentId(student.getId())
                        .status(StudentExamStatus.NOT_STARTED)
                        .startTime(paper.getStartTime())
                        .endTime(paper.getEndTime())
                        .build();

                assignments.add(assignment);
            }
        }

        if (!assignments.isEmpty()) {
            assignments = studentExamAssignmentRepository.saveAll(assignments);
        }

        paper.setStatus("PUBLISHED");
        assessmentPaperRepository.save(paper);


        Map<String, Object> wsPayload = new HashMap<>();
        wsPayload.put("assessmentPaperId", paper.getId());
        wsPayload.put("examTitle", paper.getExamTitle());
        wsPayload.put("durationMinutes", paper.getDurationMinutes());
        wsPayload.put("questionCount", paper.getQuestionIds() != null ? paper.getQuestionIds().size() : 0);
        wsPayload.put("startTime", paper.getStartTime() != null ? paper.getStartTime().toString() : null);
        wsPayload.put("endTime", paper.getEndTime() != null ? paper.getEndTime().toString() : null);
        wsPayload.put("status", "NOT_STARTED");


        for (StudentCourseProjection student : students) {



                String destination = String.format("/topic/course/%s/student/%s/exams", offeringId, student.getId());

                // Gán assignmentId (Nếu Frontend dùng làm key React). Lấy chính id của paper làm fallback
                wsPayload.put("assignmentId", paper.getId());

                messagingTemplate.convertAndSend(destination, wsPayload);
            try {

                notificationClient.createNotification(
                        paper.getLecturerId(),
                        student.getId(),
                        "Bạn có đề thi mới",
                        "Giảng viên đã giao đề: " + (paper.getExamTitle() != null ? paper.getExamTitle() : "Đề thi")
                );

            } catch (Exception ex) {


                log.warn("Send notification failed for student {}", student.getId(), ex);
            }
        }
    }

    public List<StudentAssignedExamResponse> getAssignedExamsForStudent(String studentId, String offeringId) {
        if (studentId == null || studentId.isBlank()) {
            throw new BadRequestException("studentId không hợp lệ");
        }
        if (offeringId == null || offeringId.isBlank()) {
            throw new BadRequestException("offeringId không hợp lệ");
        }

        // 1) lấy assignment theo sinh viên
        List<StudentExamAssignment> assignments = studentExamAssignmentRepository.findByStudentId(studentId);
        if (assignments.isEmpty()) return List.of();


        Map<String, StudentExamAssignment> assignmentByPaperId = assignments.stream()
                .filter(a -> a.getAssessmentPaperId() != null)
                .collect(Collectors.toMap(
                        StudentExamAssignment::getAssessmentPaperId,
                        a -> a,
                        (a1, a2) -> a1
                ));

        List<String> paperIds = new ArrayList<>(assignmentByPaperId.keySet());

        // 3) chỉ lấy paper thuộc offeringId cần lọc
        Map<String, AssessmentPaper> papersById = new LinkedHashMap<>();
        assessmentPaperRepository.findByIdInAndOfferingId(paperIds, offeringId)
                .forEach(paper -> papersById.put(paper.getId(), paper));
        assessmentPaperRepository.findByIdInAndSourceQuestionBankId(paperIds, offeringId).stream()
                .filter(paper -> paper.getOfferingId() == null || paper.getOfferingId().isBlank())
                .forEach(paper -> papersById.putIfAbsent(paper.getId(), paper));
        List<AssessmentPaper> papers = new ArrayList<>(papersById.values());

        // 4) build response
        return papers.stream().map(paper -> {
            StudentExamAssignment a = assignmentByPaperId.get(paper.getId());
            if (a == null) return null;

            return StudentAssignedExamResponse.builder()
                    .assignmentId(a.getId())
                    .assessmentPaperId(paper.getId())
                    .examTitle(paper.getExamTitle())
                    .durationMinutes(paper.getDurationMinutes())
                    .startTime(paper.getStartTime())
                    .endTime(paper.getEndTime())
                    .status(a.getStatus())
                    .questionCount(paper.getQuestionIds() != null ? paper.getQuestionIds().size() : 0)
                    .build();
        }).filter(java.util.Objects::nonNull).toList();
    }
    public void unlockExamSession(String examId, String studentId, String deviceToken) {

        String lockKey = "exam_lock:" + examId + ":" + studentId;

        String lockedToken = redisTemplate.opsForValue().get(lockKey);
        System.out.println("Không thể UnBlock"+lockedToken);
        if (lockedToken == null) {
            throw new ResourceNotFoundException("Phiên làm bài không tồn tại.");
        }

        if (!lockedToken.equals(deviceToken)) {
            throw new IllegalArgumentException("Token không khớp.");
        }

        redisTemplate.delete(lockKey);


    }
    public void exitExam(
            String paperId,
            String studentId,
            String token
    ) {

        String key =
                "exam_lock:" + paperId + ":" + studentId;

        String lockedToken =
                redisTemplate.opsForValue().get(key);

        if (lockedToken != null &&
                lockedToken.equals(token)) {

            redisTemplate.delete(key);
        }
    }
    @Transactional
    public LecturerExamDetailResponse getStudentExamToTake(String paperId, String studentId, String currentToken) {

        AssessmentPaper paper = assessmentPaperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề thi với ID: " + paperId));
        CourseOffering offering = courseOfferingRepository
                .findById(resolveOfferingId(paper))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học phần"));
        String lockKey = "exam_lock:" + paperId + ":" + studentId;
        String lockedToken = redisTemplate.opsForValue().get(lockKey);

        if (lockedToken != null && !lockedToken.equals(currentToken)) {
            throw new RuntimeException("Tài khoản của bạn đang làm bài thi này trên một thiết bị hoặc trình duyệt khác!");
        }

        // Thời gian làm bài + 5 phút dự phòng (hoặc lấy từ cấu hình paper)
        long durationMinutes = paper.getDurationMinutes() + 5;
        redisTemplate.opsForValue().set(lockKey, currentToken, Duration.ofMinutes(durationMinutes));

        // 2. LẤY CÂU HỎI VÀ TÍNH ĐIỂM
        List<Question> questions = (List<Question>) questionRepository.findAllById(paper.getQuestionIds());
        double totalWeight = 0;
        for (Question q : questions) {
            if (q.getDifficulty() == Difficulty.EASY) totalWeight += 1.0;
            else if (q.getDifficulty() == Difficulty.MEDIUM) totalWeight += 2.0;
            else if (q.getDifficulty() == Difficulty.HARD) totalWeight += 3.0;
        }

        double baseScorePerWeight = 10.0 / totalWeight;
        double currentTotalScore = 0.0;
        List<LecturerExamDetailResponse.ExamQuestionDetailDTO> questionDTOs = new ArrayList<>();

        for (int i = 0; i < questions.size(); i++) {
            Question q = questions.get(i);
            double questionScore = 0.0;

            if (q.getDifficulty() == Difficulty.EASY) questionScore = Math.round(1.0 * baseScorePerWeight * 100.0) / 100.0;
            else if (q.getDifficulty() == Difficulty.MEDIUM) questionScore = Math.round(2.0 * baseScorePerWeight * 100.0) / 100.0;
            else if (q.getDifficulty() == Difficulty.HARD) questionScore = Math.round(3.0 * baseScorePerWeight * 100.0) / 100.0;

            if (i == questions.size() - 1) {
                questionScore = Math.round((10.0 - currentTotalScore) * 100.0) / 100.0;
            } else {
                currentTotalScore += questionScore;
            }

            // BẢO MẬT: KHÔNG TÍNH TOÁN VÀ KHÔNG TRẢ VỀ correctIndex CHO SINH VIÊN
            questionDTOs.add(LecturerExamDetailResponse.ExamQuestionDetailDTO.builder()
                    .id(q.getId())
                    .content(q.getContent())
                    .difficulty(q.getDifficulty().name())
                    .cloCode(q.getCloIds())
                    .points(questionScore)
                    .type(q.getType() != null ? q.getType().name() : "MULTIPLE_CHOICE")
                    .options(q.getOptions())
                    .build());
        }


        return LecturerExamDetailResponse.builder()
                .examId(paper.getId())
                .examTitle(paper.getExamTitle())
                .durationMinutes(paper.getDurationMinutes())
                .totalPoints(10.0)
                .questions(questionDTOs)
                .courseCode(offering.getOfferingId())
                .courseName(offering.getOfferingName())
                .status(paper.getStatus())
                .build();
    }
    public AssessmentPaper updateExamPaper(String id, String userId, UpdateAssessmentPaperRequest request) {
        AssessmentPaper paper = assessmentPaperRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề thi"));


        LecturerResponse lecturer = userClient.getLecturerByUserId(userId);
        if (paper.getLecturerId() != null && !paper.getLecturerId().equals(lecturer.getLecturerId())) {
            throw new IllegalStateException("Bạn không có quyền sửa đề thi này");
        }


        if ("PUBLISHED".equalsIgnoreCase(paper.getStatus())) {
            throw new IllegalStateException("Đề thi đã giao, không thể chỉnh sửa");
        }

        if (request.getExamTitle() != null) paper.setExamTitle(request.getExamTitle());
        if (request.getDurationMinutes() != null) paper.setDurationMinutes(request.getDurationMinutes());
        if (request.getStartTime() != null) paper.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) paper.setEndTime(request.getEndTime());
        if (request.getQuestionIds() != null) paper.setQuestionIds(request.getQuestionIds());
        if (request.getSourceQuestionBankId() != null) paper.setSourceQuestionBankId(request.getSourceQuestionBankId());

        return assessmentPaperRepository.save(paper);
    }


    public void deleteExamPaper(String id, String userId) {
        AssessmentPaper paper = assessmentPaperRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề thi"));

        LecturerResponse lecturer = userClient.getLecturerByUserId(userId);
        if (paper.getLecturerId() != null && !paper.getLecturerId().equals(lecturer.getLecturerId())) {
            throw new IllegalStateException("Bạn không có quyền xóa đề thi này");
        }

        if ("PUBLISHED".equalsIgnoreCase(paper.getStatus())) {
            throw new IllegalStateException("Đề thi đã giao, không thể xóa");
        }

        assessmentPaperRepository.delete(paper);
    }

    private String resolveOfferingId(AssessmentPaper paper) {
        if (paper.getOfferingId() != null && !paper.getOfferingId().isBlank()) {
            return paper.getOfferingId();
        }
        if (paper.getSourceQuestionBankId() != null && !paper.getSourceQuestionBankId().isBlank()) {
            return paper.getSourceQuestionBankId();
        }
        throw new BadRequestException("Đề thi chưa được gắn với lớp học phần");
    }
}
