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

    @PostMapping("/course/{offeringId}/bank/{bankId}")
    public ResponseEntity<Question> createQuestionToBank(
            @PathVariable String offeringId,
            @PathVariable String bankId,
            @RequestBody QuestionRequest request) {
        System.out.println("Các CLO đã tạo khi tạo câu hỏi"+request.getCloIds());
        return ResponseEntity.ok(questionService.createQuestionToBank(offeringId, bankId, request));
    }

    @DeleteMapping("/course/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable String id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/bank/{bankId}/question/{questionId}")
    public ResponseEntity<Void> deleteQuestionFromBank(
            @PathVariable String bankId,
            @PathVariable String questionId) {
        questionService.deleteQuestionFromBank(bankId, questionId);
        return ResponseEntity.noContent().build();
    }
    @PostMapping(value = "/course/{offeringId}/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> importQuestions(
            @PathVariable String offeringId,
            @RequestParam("file") MultipartFile file,
            @PathVariable String bankId) {
        try {


            List<Question> importedQuestions = questionService.importQuestionsFromExcel(offeringId, bankId,file);
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
    @GetMapping("/course/{offeringId}/bank/{bankId}/count")
    public ResponseEntity<Long> countQuestionsByBank(
            @PathVariable String offeringId,
            @PathVariable String bankId
    ) {
        return ResponseEntity.ok(
                questionService.countQuestionsInBank(
                        offeringId,
                        bankId
                )
        );
    }
    @PostMapping(
            value = "/course/{offeringId}/bank/{bankId}/import",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> importQuestionsToBank(
            @PathVariable String offeringId,
            @PathVariable String bankId,
            @RequestParam("file") MultipartFile file
    ) {

        try {

            List<Question> importedQuestions =
                    questionService.importQuestionsToBank(
                            offeringId,
                            bankId,
                            file
                    );

            return ResponseEntity.ok(
                    "Import thành công "
                            + importedQuestions.size()
                            + " câu hỏi."
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
    @PostMapping("/course/counts")
    public ResponseEntity<Map<String, Long>> getQuestionCountsByCourses(@RequestBody List<String> offeringIds) {
        return ResponseEntity.ok(questionService.getQuestionCountsForOfferings(offeringIds));
    }
    @GetMapping("/course/{offeringId}/bank/{bankId}")
    public ResponseEntity<List<Question>> getQuestionsByBank(
            @PathVariable String offeringId,
            @PathVariable String bankId
    ) {
        return ResponseEntity.ok(
                questionService.getQuestionsByBankId(
                        offeringId,
                        bankId
                )
        );
    }

    @GetMapping("/bank/{bankId}")
    public ResponseEntity<List<Question>> getQuestionsByBankId(
            @PathVariable String bankId
    ) {
        return ResponseEntity.ok(questionService.getQuestionsByBankId(bankId));
    }
}
