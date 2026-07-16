package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.NotificationClient;
import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.GenerateExamRequest;
import hcmuaf.edu.vn.fit.course_service.dto.request.NotificationRequest;
import hcmuaf.edu.vn.fit.course_service.dto.request.UpdateAssessmentPaperRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.*;
import hcmuaf.edu.vn.fit.course_service.entity.*;
import hcmuaf.edu.vn.fit.course_service.entity.enums.Difficulty;
import hcmuaf.edu.vn.fit.course_service.entity.enums.StudentExamStatus;
import hcmuaf.edu.vn.fit.course_service.exception.BadRequestException;
import hcmuaf.edu.vn.fit.course_service.exception.ResourceNotFoundException;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.EnrollmentRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.SubmissionRepository;
import hcmuaf.edu.vn.fit.course_service.repository.mongo.AssessmentPaperRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.AssessmentRepository;
import hcmuaf.edu.vn.fit.course_service.repository.mongo.QuestionRepository;
import hcmuaf.edu.vn.fit.course_service.repository.mongo.StudentExamAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.logging.Log;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class AssessmentPaperService {

    private final QuestionRepository questionRepository;
    private final UserClient userClient;
    private final AssessmentRepository assessmentRepository;
    private final NotificationClient notificationClient;
    private Log log;
    private final AssessmentPaperRepository assessmentPaperRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentExamAssignmentRepository studentExamAssignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final CourseOfferingRepository courseOfferingRepository;


    public List<ExamQuestionDetailResponse> generateExamQuestions(String userId, GenerateExamRequest request) {
        // 1. Lấy tất cả câu hỏi hợp lệ từ Ngân hàng câu hỏi (Question Bank)
        List<Question> allQuestions = questionRepository.findByOfferingId(request.getOfferingId());

        // 2. Phân loại câu hỏi theo độ khó
        List<Question> easyPool = allQuestions.stream().filter(q -> q.getDifficulty() == Difficulty.EASY).collect(Collectors.toList());
        List<Question> mediumPool = allQuestions.stream().filter(q -> q.getDifficulty() == Difficulty.MEDIUM).collect(Collectors.toList());
        List<Question> hardPool = allQuestions.stream().filter(q -> q.getDifficulty() == Difficulty.HARD).collect(Collectors.toList());

        // 3. Kiểm tra số lượng câu hỏi trong kho xem có đủ để lấy không
        if (easyPool.size() < request.getEasyCount() ||
                mediumPool.size() < request.getMediumCount() ||
                hardPool.size() < request.getHardCount()) {
            throw new BadRequestException("Số lượng câu hỏi trong kho không đủ để tạo đề theo cấu hình yêu cầu!");
        }


        Collections.shuffle(easyPool);
        Collections.shuffle(mediumPool);
        Collections.shuffle(hardPool);

        List<Question> selectedQuestions = new ArrayList<>();
        selectedQuestions.addAll(easyPool.subList(0, request.getEasyCount()));
        selectedQuestions.addAll(mediumPool.subList(0, request.getMediumCount()));
        selectedQuestions.addAll(hardPool.subList(0, request.getHardCount()));
        List<String> questionIds = selectedQuestions.stream()
                .map(Question::getId)
                .collect(Collectors.toList());


        int totalQuestions = selectedQuestions.size();
        if (totalQuestions == 0) {
            throw new BadRequestException("Tổng số câu hỏi trong đề phải lớn hơn 0!");
        }

        // 5. --- THUẬT TOÁN TÍNH ĐIỂM THEO TRỌNG SỐ ĐỘ KHÓ

        double totalWeight = (request.getEasyCount() * 1.0)
                + (request.getMediumCount() * 2.0)
                + (request.getHardCount() * 3.0);

        // Điểm của mỗi đơn vị trọng số
        double baseScorePerWeight = 10.0 / totalWeight;

        List<ExamQuestionDetailResponse> examQuestions = new ArrayList<>();
        double currentTotalScore = 0.0;

        for (int i = 0; i < selectedQuestions.size(); i++) {
            Question q = selectedQuestions.get(i);
            double questionScore = 0.0;

            // Tính điểm tạm thời dựa trên độ khó và làm tròn đến 2 chữ số thập phân
            if (q.getDifficulty() == Difficulty.EASY) {
                questionScore = Math.round(1.0 * baseScorePerWeight * 100.0) / 100.0;
            } else if (q.getDifficulty() == Difficulty.MEDIUM) {
                questionScore = Math.round(2.0 * baseScorePerWeight * 100.0) / 100.0;
            } else if (q.getDifficulty() == Difficulty.HARD) {
                questionScore = Math.round(3.0 * baseScorePerWeight * 100.0) / 100.0;
            }
            if (request.getExamTitle() == null || request.getExamTitle().trim().isEmpty()) {
                throw new BadRequestException("Tên đề thi không được để trống!");
            }
            if (request.getDurationMinutes() == null || request.getDurationMinutes() <= 0) {
                throw new BadRequestException("Thời lượng làm bài phải lớn hơn 0 phút!");
            }
            if (request.getStartTime() == null || request.getEndTime() == null) {
                throw new BadRequestException("Vui lòng cung cấp thời gian bắt đầu và kết thúc!");
            }
            if (!request.getEndTime().isAfter(request.getStartTime())) {
                throw new BadRequestException("Thời gian kết thúc phải sau thời gian bắt đầu!");
            }
            long diffMinutes = java.time.Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
            if (diffMinutes != request.getDurationMinutes()) {
                throw new BadRequestException("durationMinutes không khớp với khoảng thời gian bắt đầu/kết thúc!");
            }

            // XỬ LÝ CÂU HỎI CUỐI CÙNG: Lấy 10 trừ đi tổng điểm của các câu trước đó

            if (i == selectedQuestions.size() - 1) {
                questionScore = Math.round((10.0 - currentTotalScore) * 100.0) / 100.0;
            } else {
                currentTotalScore += questionScore;
            }

            examQuestions.add(new ExamQuestionDetailResponse(q.getId(), q.getContent(), q.getDifficulty(), questionScore));
        }
        LecturerResponse lecturer = userClient.getLecturerByUserId(userId);
        String assessmentId = request.getAssessmentId();
        if (assessmentId != null && !assessmentId.isEmpty()) {

            assessmentRepository.findById(assessmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài thi!"));
        }
        AssessmentPaper assessmentPaper = AssessmentPaper.builder()
                .assessmentId(assessmentId)
                .lecturerId(lecturer.getLecturerId())
                .sourceQuestionBankId(request.getOfferingId())
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

    public List<AssessmentPaper> getAllByLecturer(String userId) {
        LecturerResponse lecturerResponse = userClient.getLecturerByUserId(userId);
        String lecturerId = lecturerResponse.getLecturerId();
        return assessmentPaperRepository.findByLecturerId(lecturerId);
    }


    public AssessmentPaper getPaperDetail(String paperId) {
        return assessmentPaperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề thi"));
    }

    //    public List<AssessmentPaper> getAllByLecturer(String userId) {
//        LecturerResponse lecturerResponse = userClient.getLecturerByUserId(userId);
//        String lecturerId = lecturerResponse.getLecturerId();
//
//        return assessmentPaperRepository.findByLecturerId(lecturerId);
//    }
    @Transactional
    public void publishExam(String assessmentPaperId) {
        AssessmentPaper paper = assessmentPaperRepository.findById(assessmentPaperId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề thi với ID: " + assessmentPaperId));

        if ("PUBLISHED".equalsIgnoreCase(paper.getStatus())) {
            throw new BadRequestException("Đề thi đã được giao trước đó");
        }

        paper.setStatus("PUBLISHED");
        assessmentPaperRepository.save(paper);

        List<StudentCourseProjection> students =
                enrollmentRepository.findStudentsByOfferingId(paper.getSourceQuestionBankId());

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
            studentExamAssignmentRepository.saveAll(assignments);
        }


        for (StudentCourseProjection student : students) {
            try {
                notificationClient.createNotification(
                        paper.getLecturerId(),
                        student.getId(),
                        "Bạn có đề thi mới",
                        "Giảng viên đã giao đề: " + (paper.getExamTitle() != null ? paper.getExamTitle() : "Đề thi")
                );
            } catch (Exception ex) {


                log.warn("Send notification failed for student {}");
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
        List<AssessmentPaper> papers = assessmentPaperRepository
                .findByIdInAndSourceQuestionBankId(paperIds, offeringId);

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

    public LecturerExamDetailResponse getLecturerExamDetail(String paperId) {

        AssessmentPaper paper = assessmentPaperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề thi với ID: " + paperId));

        // Lấy danh sách câu hỏi
        List<Question> questions = (List<Question>) questionRepository.findAllById(paper.getQuestionIds());

        // 2. Tính lại điểm cho từng câu hỏi (Theo logic lúc generate)
        double totalWeight = 0;
        for (Question q : questions) {
            if (q.getDifficulty() == Difficulty.EASY) totalWeight += 1.0;
            else if (q.getDifficulty() == Difficulty.MEDIUM) totalWeight += 2.0;
            else if (q.getDifficulty() == Difficulty.HARD) totalWeight += 3.0;
        }

        double baseScorePerWeight = 10.0 / totalWeight;
        double currentTotalScore = 0.0;
        List<LecturerExamDetailResponse.ExamQuestionDetailDTO> questionDTOs = new ArrayList<>();


        String finalOfferingId;
        String courseName = "Môn học";
        if (!questions.isEmpty()) {
            finalOfferingId = questions.get(0).getOfferingId();

            CourseOffering offering = courseOfferingRepository.findById(finalOfferingId).orElse(null);
            if (offering != null && offering.getCourse() != null) {
                courseName = offering.getCourse().getCourseName();
            }
        } else {
            finalOfferingId = "";
        }

        for (int i = 0; i < questions.size(); i++) {
            Question q = questions.get(i);
            double questionScore = 0.0;

            if (q.getDifficulty() == Difficulty.EASY) questionScore = Math.round(1.0 * baseScorePerWeight * 100.0) / 100.0;
            else if (q.getDifficulty() == Difficulty.MEDIUM) questionScore = Math.round(2.0 * baseScorePerWeight * 100.0) / 100.0;
            else if (q.getDifficulty() == Difficulty.HARD) questionScore = Math.round(3.0 * baseScorePerWeight * 100.0) / 100.0;

            // Xử lý câu cuối cùng để tròn 10 điểm
            if (i == questions.size() - 1) {
                questionScore = Math.round((10.0 - currentTotalScore) * 100.0) / 100.0;
            } else {
                currentTotalScore += questionScore;
            }


            int correctIndex = -1;
            if (q.getOptions() != null && !q.getOptions().isEmpty()) {
                for (int j = 0; j < q.getOptions().size(); j++) {
                    if (Boolean.TRUE.equals(q.getOptions().get(j).getCorrect())) {
                        correctIndex = j;
                        break;
                    }
                }
            }

            questionDTOs.add(LecturerExamDetailResponse.ExamQuestionDetailDTO.builder()
                    .id(q.getId())
                    .content(q.getContent())
                    .difficulty(q.getDifficulty().name())
                    .points(questionScore)
                    .type(q.getType() != null ? q.getType().name() : "MULTIPLE_CHOICE")
                    .options(q.getOptions())
                    .correctOptionIndex(correctIndex)
                    .cloCode(q.getCloIds())
                    .build());
        }

        // 3. Lấy thông tin sinh viên được giao bài thi
        List<StudentExamAssignment> assignments = studentExamAssignmentRepository.findByAssessmentPaperId(paperId);

        List<LecturerExamDetailResponse.StudentSubmissionRowDTO> submissionDTOs = assignments.stream().map(a -> {

            SinhVienResponse sinhVienResponse = userClient.getSinhVien(a.getStudentId());


            SubmissionEntity submission = submissionRepository
                    .findByAssessmentIdAndStudentId(a.getAssessmentPaperId(), a.getStudentId())
                    .orElse(null);



            return LecturerExamDetailResponse.StudentSubmissionRowDTO.builder()
                    .studentId(a.getStudentId())
                    .studentName(sinhVienResponse != null ? sinhVienResponse.getFullName() : "N/A")
                    .studentCode(sinhVienResponse != null ? sinhVienResponse.getUserId() : "N/A")
                    .classCode(finalOfferingId)
                    .score(submission != null ? submission.getGradeCore() : null)
                    // Đã sửa lỗi ép kiểu thời gian
                    .submitTime(submission != null && submission.getSubmittedAt() != null
                            ? submission.getSubmittedAt().atZone(java.time.ZoneId.systemDefault()).toInstant()
                            : null)
                    .status(a.getStatus() != null ? a.getStatus().name() : "N/A")
                    .build();
        }).collect(Collectors.toList());


        return LecturerExamDetailResponse.builder()
                .examId(paper.getId())
                .examTitle(paper.getExamTitle())
                .courseName(courseName)
                .courseCode(finalOfferingId)
                .durationMinutes(paper.getDurationMinutes())
                .totalPoints(10.0)
                .status(paper.getStatus())
                .createdAt(paper.getCreatedAt())
                .questions(questionDTOs)
                .submissions(submissionDTOs)
                .build();
    }
    public AssessmentPaper updateExamPaper(String id, String userId, UpdateAssessmentPaperRequest request) {
        AssessmentPaper paper = assessmentPaperRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề thi"));


        if (paper.getLecturerId() != null && !paper.getLecturerId().equals(userId)) {
            throw new IllegalStateException("Bạn không có quyền sửa đề thi này");
        }


        if ("PUBLISHED".equalsIgnoreCase(paper.getStatus())) {
            throw new IllegalStateException("Đề thi đã giao, không thể chỉnh sửa");
        }

        if (request.getExamTitle() != null) paper.setExamTitle(request.getExamTitle());
        if (request.getDurationMinutes() != null) paper.setDurationMinutes(request.getDurationMinutes());
        if (request.getStartTime() != null) paper.setStartTime(Instant.from(request.getStartTime()));
        if (request.getEndTime() != null) paper.setEndTime(Instant.from(request.getEndTime()));
        if (request.getQuestionIds() != null) paper.setQuestionIds(request.getQuestionIds());
        if (request.getSourceQuestionBankId() != null) paper.setSourceQuestionBankId(request.getSourceQuestionBankId());

        return assessmentPaperRepository.save(paper);
    }


    public void deleteExamPaper(String id, String userId) {
        AssessmentPaper paper = assessmentPaperRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề thi"));

        if (paper.getLecturerId() != null && !paper.getLecturerId().equals(userId)) {
            throw new IllegalStateException("Bạn không có quyền xóa đề thi này");
        }

        if ("PUBLISHED".equalsIgnoreCase(paper.getStatus())) {
            throw new IllegalStateException("Đề thi đã giao, không thể xóa");
        }

        assessmentPaperRepository.delete(paper);
    }
}