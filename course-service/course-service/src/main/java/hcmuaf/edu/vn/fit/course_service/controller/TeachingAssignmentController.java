package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.TeachingAssignmentProposalRequest;
import hcmuaf.edu.vn.fit.course_service.dto.request.TeachingAssignmentReviewRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.TeachingAssignmentProposalResponse;
import hcmuaf.edu.vn.fit.course_service.service.TeachingAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/course-service/teaching-assignments")
public class TeachingAssignmentController {
    private final TeachingAssignmentService service;

    @GetMapping
    public ResponseEntity<List<TeachingAssignmentProposalResponse>> getProposals(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "ALL") String status
    ) {
        return ResponseEntity.ok(service.getProposals(userId, status));
    }

    @PostMapping
    public ResponseEntity<TeachingAssignmentProposalResponse> createProposal(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody TeachingAssignmentProposalRequest request
    ) {
        return ResponseEntity.ok(service.createProposal(userId, request));
    }

    @PutMapping("/{proposalId}")
    public ResponseEntity<TeachingAssignmentProposalResponse> updateProposal(
            @PathVariable String proposalId,
            @RequestHeader("X-User-Id") String userId,
            @RequestBody TeachingAssignmentProposalRequest request
    ) {
        return ResponseEntity.ok(service.updateProposal(proposalId, userId, request));
    }

    @DeleteMapping("/{proposalId}")
    public ResponseEntity<TeachingAssignmentProposalResponse> cancelProposal(
            @PathVariable String proposalId,
            @RequestHeader("X-User-Id") String userId
    ) {
        return ResponseEntity.ok(service.cancelProposal(proposalId, userId));
    }

    @PutMapping("/{proposalId}/review")
    public ResponseEntity<TeachingAssignmentProposalResponse> reviewProposal(
            @PathVariable String proposalId,
            @RequestHeader("X-User-Id") String userId,
            @RequestBody TeachingAssignmentReviewRequest request
    ) {
        return ResponseEntity.ok(service.reviewProposal(proposalId, userId, request));
    }
}
