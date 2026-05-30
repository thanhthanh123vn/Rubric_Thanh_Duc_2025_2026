package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.QuestionRequest; // Bạn cần tạo DTO này
import hcmuaf.edu.vn.fit.course_service.entity.Question;
import hcmuaf.edu.vn.fit.course_service.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/course-service/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Question>> getQuestionsByCourse(@PathVariable String courseId) {
        return ResponseEntity.ok(questionService.getQuestionsByCourseId(courseId));
    }

    @PostMapping("/course/{courseId}")
    public ResponseEntity<Question> createQuestion(
            @PathVariable String courseId,
            @RequestBody QuestionRequest request) {
        return ResponseEntity.ok(questionService.createQuestion(courseId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable String id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
    @PostMapping(value = "/course/{courseId}/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> importQuestions(
            @PathVariable String courseId,
            @RequestParam("file") MultipartFile file) {
        try {
            // Có thể check định dạng file trước (file.getContentType() hoặc đuôi file .xlsx)

            List<Question> importedQuestions = questionService.importQuestionsFromExcel(courseId, file);
            return ResponseEntity.ok("Import thành công " + importedQuestions.size() + " câu hỏi.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}