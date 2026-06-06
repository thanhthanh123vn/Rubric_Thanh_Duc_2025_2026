package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.CreateAttendanceSessionRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.AttendanceSessionSummaryResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.AttendanceSessionResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.AttendanceStudentResponse;
import hcmuaf.edu.vn.fit.course_service.service.AttendanceSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping({
        "/attendance-sessions",
        "/api/attendance-sessions",
        "/api/v1/course-service/attendance-sessions"
})
public class AttendanceSessionController {

    private final AttendanceSessionService attendanceSessionService;

    @PostMapping
    public ResponseEntity<AttendanceSessionResponse> createAttendanceSession(
            @RequestBody CreateAttendanceSessionRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String currentUserId
    ) {
        AttendanceSessionResponse response = attendanceSessionService.createAttendanceSession(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/offering/{offeringId}")
    public ResponseEntity<List<AttendanceSessionSummaryResponse>> getSessionsByOffering(
            @PathVariable String offeringId
    ) {
        return ResponseEntity.ok(attendanceSessionService.getSessionsByOffering(offeringId));
    }

    @GetMapping("/offering/{offeringId}/active")
    public ResponseEntity<AttendanceSessionResponse> getActiveSession(
            @PathVariable String offeringId
    ) {
        return ResponseEntity.ok(attendanceSessionService.getActiveSession(offeringId));
    }

    @GetMapping("/{sessionId}/records")
    public ResponseEntity<List<AttendanceStudentResponse>> getAttendanceBySession(
            @PathVariable String sessionId
    ) {
        return ResponseEntity.ok(attendanceSessionService.getAttendanceBySession(sessionId));
    }
}
