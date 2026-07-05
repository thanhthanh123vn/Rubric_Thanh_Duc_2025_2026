package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.StudentAttendanceCheckInRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.AttendanceCheckInResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.AttendanceHistoryResponse;
import hcmuaf.edu.vn.fit.course_service.service.StudentAttendanceService;
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

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping({
        "/attendance",
        "/api/attendance",
        "/api/v1/course-service/attendance"
})
public class StudentAttendanceController {

    private final StudentAttendanceService studentAttendanceService;

    @PostMapping("/check-in")
    public ResponseEntity<AttendanceCheckInResponse> checkIn(
            @RequestBody StudentAttendanceCheckInRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String currentStudentId,
            HttpServletRequest httpServletRequest
    ) {
        AttendanceCheckInResponse response = studentAttendanceService.checkIn(currentStudentId, request, httpServletRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/offering/{offeringId}/me")
    public ResponseEntity<List<AttendanceHistoryResponse>> getMyAttendanceHistory(
            @PathVariable String offeringId,
            @RequestHeader(value = "X-User-Id", required = false) String currentStudentId
    ) {
        return ResponseEntity.ok(studentAttendanceService.getMyAttendanceHistory(currentStudentId, offeringId));
    }
}
