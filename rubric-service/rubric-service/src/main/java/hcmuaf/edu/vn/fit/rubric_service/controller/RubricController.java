package hcmuaf.edu.vn.fit.rubric_service.controller;

import hcmuaf.edu.vn.fit.rubric_service.client.UserClient;
import hcmuaf.edu.vn.fit.rubric_service.dto.request.RubricApprovalRequest;
import hcmuaf.edu.vn.fit.rubric_service.dto.request.RubricRequest;
import hcmuaf.edu.vn.fit.rubric_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.rubric_service.dto.response.RubricMatrixResponse;
import hcmuaf.edu.vn.fit.rubric_service.dto.response.RubricResponse;
import hcmuaf.edu.vn.fit.rubric_service.dto.response.UserResponse;
import hcmuaf.edu.vn.fit.rubric_service.entity.Rubric;
import hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricStatus;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricRepository;
import hcmuaf.edu.vn.fit.rubric_service.service.RubricService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/rubric-service/rubrics")
public class RubricController {

    @Autowired
    private RubricService rubricService;

    @GetMapping
    public List<RubricResponse> getAll() {
        return rubricService.getAllRubrics();
    }
    @GetMapping("/matrix")
    public ResponseEntity<List<RubricMatrixResponse>> getRubricMatrices() {
        return ResponseEntity.ok(rubricService.getRubricMatrices());
    }

    @GetMapping("/matrix/{rubricId}")
    public ResponseEntity<RubricMatrixResponse> getRubricMatrixDetail(
            @PathVariable String rubricId
    ) {
        return ResponseEntity.ok(rubricService.getRubricMatrixDetail(rubricId));
    }

    @GetMapping("/{id}")
    public Rubric getById(@PathVariable String id) {
        return rubricService.getById(id);
    }

//    @PostMapping
//    public Rubric create(@RequestBody Rubric rubric) {
//        return rubricService.create(rubric);
//    }
    @PostMapping
    public ResponseEntity<?> createRubric(
            @RequestHeader("X-User-Id") String lecturerId,
            @RequestBody RubricRequest request
    ) {
        try {
            Rubric createdRubric = rubricService.createRubric(lecturerId, request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", request.isSubmitForApproval() ? "Đã gửi Rubric đi phê duyệt" : "Đã lưu nháp Rubric",
                    "data", createdRubric
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Lỗi tạo Rubric: " + e.getMessage()
            ));
        }
    }
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        rubricService.delete(id);
    }
    @GetMapping("/approvals")
    public ResponseEntity<List<Rubric>> getRubricsForApproval(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "PENDING") String status
    ) {
        List<Rubric> rubrics = rubricService.getRubricsForApproval(userId, status);
        return ResponseEntity.ok(rubrics);
    }

    // API thực hiện phê duyệt / từ chối
    @PutMapping("/{rubricId}/review")
    public ResponseEntity<?> reviewRubric(
            @PathVariable String rubricId,
            @RequestHeader("X-User-Id") String reviewerId,
            @RequestBody RubricApprovalRequest request
    ) {
        try {
            Rubric updatedRubric = rubricService.reviewRubric(rubricId, reviewerId, request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đã xử lý Rubric thành công",
                    "data", updatedRubric
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}