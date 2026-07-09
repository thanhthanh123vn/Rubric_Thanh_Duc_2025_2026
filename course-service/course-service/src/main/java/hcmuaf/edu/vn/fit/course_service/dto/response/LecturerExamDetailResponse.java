package hcmuaf.edu.vn.fit.course_service.dto.response;

import hcmuaf.edu.vn.fit.course_service.entity.AnswerOption;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LecturerExamDetailResponse {
    private String examId;
    private String examTitle;
    private String courseName;
    private String courseCode;
    private Integer durationMinutes;
    private Double totalPoints;
    private String status;
    private Instant createdAt;
    private List<ExamQuestionDetailDTO> questions;
    private List<StudentSubmissionRowDTO> submissions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExamQuestionDetailDTO {
        private String id;
        private String content;
        private String type;
        private List<AnswerOption> options;
        private boolean correctOptionIndex;
        private Double points;
        private String difficulty; // EASY, MEDIUM, HARD
        private List<String> cloCode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentSubmissionRowDTO {
        private String studentId;
        private String studentCode;
        private String studentName;
        private String classCode;
        private Instant submitTime;
        private Double score;
        private String status;
    }
}