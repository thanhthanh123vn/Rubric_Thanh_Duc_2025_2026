package hcmuaf.edu.vn.fit.rubric_service.controller;

import hcmuaf.edu.vn.fit.rubric_service.client.ClientIpUtil;
import hcmuaf.edu.vn.fit.rubric_service.client.CourseClient;
import hcmuaf.edu.vn.fit.rubric_service.client.UserClient;
import hcmuaf.edu.vn.fit.rubric_service.dto.request.RubricApprovalRequest;
import hcmuaf.edu.vn.fit.rubric_service.dto.request.RubricRequest;
import hcmuaf.edu.vn.fit.rubric_service.dto.request.SystemLogRequest;
import hcmuaf.edu.vn.fit.rubric_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.rubric_service.dto.response.RubricMatrixResponse;
import hcmuaf.edu.vn.fit.rubric_service.dto.response.RubricResponse;
import hcmuaf.edu.vn.fit.rubric_service.dto.response.UserResponse;
import hcmuaf.edu.vn.fit.rubric_service.entity.Rubric;
import hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricStatus;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricRepository;
import hcmuaf.edu.vn.fit.rubric_service.service.RubricService;
import jakarta.servlet.http.HttpServletRequest;
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
    private final CourseClient courseClient;
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
            @RequestHeader("X-User-Username") String userName,
            @RequestBody RubricRequest request,
            HttpServletRequest httpServletRequest
    ) {
        try {

            String  ip = ClientIpUtil.getClientIp(httpServletRequest);
            SystemLogRequest log = new SystemLogRequest();
            log.setLevel("INFO");
            log.setAction("CREATE_Rubric");
            log.setMessage("Tạo Rubric thành công");
            log.setUsername(userName);
            log.setIp(ip);
            courseClient.writeLog(log);
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
    public void delete(@RequestHeader("X_User-Id") String userId,@PathVariable String id,
                       HttpServletRequest httpServletRequest) {

        if(userId==null)
            throw new RuntimeException("userId is null");
        try{
            String userName = httpServletRequest.getHeader("X-User-Username");
            String  ip = ClientIpUtil.getClientIp(httpServletRequest);
            SystemLogRequest log = new SystemLogRequest();
            log.setLevel("INFO");
            log.setAction("CREATE_Rubric");
            log.setMessage("Tạo Rubric thành công");
            log.setUsername(userName);
            log.setIp(ip);
            courseClient.writeLog(log);


        } catch (Exception e) {
            throw new RuntimeException(e);
        }
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
            @RequestHeader("X-User-UserName") String userName,
            @PathVariable String rubricId,
            @RequestHeader("X-User-Id") String reviewerId,
            @RequestBody RubricApprovalRequest request,
            HttpServletRequest httpServletRequest
    ) {
        if(userName==null) return ResponseEntity.badRequest().body("userId is null");
        try {
            String  ip = ClientIpUtil.getClientIp(httpServletRequest);
            courseClient.writeLog(
                    SystemLogRequest.builder()
                            .level("INFO")
                            .action("REVIEW_RUBRIC")
                            .message("Phê duyệt rubric")
                            .username(userName)
                            .ip(ip)
                            .build()
            );
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