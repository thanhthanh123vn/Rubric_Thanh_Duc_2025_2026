package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.TeachingAssistantAssignmentRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.TeachingAssistantAssignmentResponse;
import hcmuaf.edu.vn.fit.course_service.service.TeachingAssistantAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/course-service/teaching-assistants")
public class TeachingAssistantAssignmentController {
    private final TeachingAssistantAssignmentService service;

    @GetMapping("/offerings")
    public ResponseEntity<List<TeachingAssistantAssignmentResponse>> getMyOfferings(
            @RequestHeader("X-User-Id") String userId
    ) {
        return ResponseEntity.ok(service.getMyOfferings(userId));
    }

    @PutMapping("/offerings/{offeringId}")
    public ResponseEntity<TeachingAssistantAssignmentResponse> updateAssistants(
            @PathVariable String offeringId,
            @RequestHeader("X-User-Id") String userId,
            @RequestBody TeachingAssistantAssignmentRequest request
    ) {
        return ResponseEntity.ok(service.updateAssistants(offeringId, userId, request));
    }
}
