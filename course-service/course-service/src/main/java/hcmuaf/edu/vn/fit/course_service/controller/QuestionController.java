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
import java.util.Map;

@RestController
@RequestMapping("/api/v1/course-service/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping("/course/{offeringId}")
    public ResponseEntity<List<Question>> getQuestionsByCourse(@PathVariable String offeringId) {
        return ResponseEntity.ok(questionService.getQuestionsByOfferingId(offeringId));
    }

    @PostMapping("/course/{offeringId}")
    public ResponseEntity<Question> createQuestion(
            @PathVariable String offeringId,
            @RequestBody QuestionRequest request) {
        return ResponseEntity.ok(questionService.createQuestion(offeringId, request));
    }

    @DeleteMapping("/course/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable String id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
    @PostMapping(value = "/course/{offeringId}/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> importQuestions(
            @PathVariable String offeringId,
            @RequestParam("file") MultipartFile file) {
        try {


            List<Question> importedQuestions = questionService.importQuestionsFromExcel(offeringId, file);
            return ResponseEntity.ok("Import thành công " + importedQuestions.size() + " câu hỏi.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PutMapping("/course/{id}")
    public ResponseEntity<Question> updateQuestion(
            @PathVariable String id,
            @RequestBody QuestionRequest request) {

        Question updatedQuestion = questionService.updateQuestion(id, request);
        return ResponseEntity.ok(updatedQuestion);
    }
    @GetMapping("/course/{offeringId}/count")
    public ResponseEntity<Long> countQuestionsByCourse(@PathVariable String offeringId) {
        return ResponseEntity.ok(questionService.getQuestionCountByOfferingId(offeringId));
    }


    @PostMapping("/course/counts")
    public ResponseEntity<Map<String, Long>> getQuestionCountsByCourses(@RequestBody List<String> offeringIds) {
        return ResponseEntity.ok(questionService.getQuestionCountsForOfferings(offeringIds));
    }
}