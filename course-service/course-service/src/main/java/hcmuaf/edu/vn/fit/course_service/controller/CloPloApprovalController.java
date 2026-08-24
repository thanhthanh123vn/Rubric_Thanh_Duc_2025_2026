package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.config.UserPrincipal;
import hcmuaf.edu.vn.fit.course_service.dto.request.CloPloMappingRequest;
import hcmuaf.edu.vn.fit.course_service.dto.request.CloPloReviewRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.CloPloSubmissionResponse;
import hcmuaf.edu.vn.fit.course_service.service.CloPloApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/course-service/clo-plo-submissions")
public class CloPloApprovalController {
    private final CloPloApprovalService service;

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<CloPloSubmissionResponse> getCourseProfile(
            @PathVariable String courseId, Authentication authentication) {
        UserPrincipal user = principal(authentication);
        return ResponseEntity.ok(service.getCourseProfile(courseId, user.getUserId(), user.getRole()));
    }

    @PutMapping("/courses/{courseId}/mappings")
    public ResponseEntity<CloPloSubmissionResponse> saveMappings(
            @PathVariable String courseId,
            @RequestBody CloPloMappingRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(service.saveDraft(courseId, principal(authentication).getUserId(), request));
    }

    @PostMapping("/clos/{cloId}/submit")
    public ResponseEntity<CloPloSubmissionResponse> submitClo(
            @PathVariable String cloId, Authentication authentication) {
        return ResponseEntity.ok(service.submitClo(cloId, principal(authentication).getUserId()));
    }

    @PostMapping("/courses/{courseId}/submit-mapping")
    public ResponseEntity<CloPloSubmissionResponse> submitMapping(
            @PathVariable String courseId, Authentication authentication) {
        return ResponseEntity.ok(service.submitMapping(courseId, principal(authentication).getUserId()));
    }

    @GetMapping("/approvals")
    public ResponseEntity<List<CloPloSubmissionResponse>> approvals(
            @RequestParam(defaultValue = "PENDING_REVIEW") String status,
            Authentication authentication) {
        return ResponseEntity.ok(service.getForApproval(status, principal(authentication).getUserId()));
    }

    @PutMapping("/{submissionId}/review")
    public ResponseEntity<CloPloSubmissionResponse> review(
            @PathVariable String submissionId,
            @RequestBody CloPloReviewRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(service.review(submissionId, principal(authentication).getUserId(), request));
    }

    private UserPrincipal principal(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal user)) {
            throw new SecurityException("Không xác định được người dùng.");
        }
        return user;
    }
}
