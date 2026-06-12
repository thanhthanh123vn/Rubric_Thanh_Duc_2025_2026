package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.QuestionBankRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.QuestionBankResponse;
import hcmuaf.edu.vn.fit.course_service.service.QuestionBankService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/course-service/question-banks")
@RequiredArgsConstructor
public class QuestionBankController {

    private final QuestionBankService questionBankService;
    private final UserClient userClient;

    private String resolveLecturerId(String userId) {
        LecturerResponse lecturer = userClient.getLecturerByUserId(userId);
        return lecturer.getLecturerId();
    }

    @PostMapping
    public ResponseEntity<?> createBank(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody QuestionBankRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(questionBankService.createQuestionBank(request, resolveLecturerId(userId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBank(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String id,
            @RequestBody QuestionBankRequest request) {
        try {
            return ResponseEntity.ok(
                    questionBankService.updateQuestionBank(id, request, resolveLecturerId(userId))
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBank(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String id) {
        try {
            questionBankService.deleteQuestionBank(id, resolveLecturerId(userId));
            return ResponseEntity.ok("Xóa kho câu hỏi thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/course/{offeringId}")
    public ResponseEntity<?> getBanksByCourse(@PathVariable String offeringId) {
        return ResponseEntity.ok(questionBankService.getBanksByOfferingId(offeringId));
    }
    @GetMapping("/course/dep/{offeringId}")
    public ResponseEntity<?> getBanksByCourseForDep(@PathVariable String offeringId) {
        return ResponseEntity.ok(questionBankService.getBanksByOfferingIdForDep(offeringId));
    }
    @GetMapping("/all")
    public ResponseEntity<?> getAllQuestionBanks( @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(questionBankService.getAllQuestionBanks(userId));
    }
    @GetMapping("/lecturer")
    public ResponseEntity<List<QuestionBankResponse>> getQuestionsByLecturerUserId(@RequestHeader("X-User-Id") String userId) {

        List<QuestionBankResponse> questions = questionBankService.getQuestionsByLecturerUserId(userId);
        return ResponseEntity.ok(questions);
    }

}
