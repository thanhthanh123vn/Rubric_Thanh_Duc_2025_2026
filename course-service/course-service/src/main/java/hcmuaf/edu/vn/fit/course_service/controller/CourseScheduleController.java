package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.ScheduleRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.ScheduleResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.StudentScheduleResponse;
import hcmuaf.edu.vn.fit.course_service.service.CourseScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/course-service/course-schedules")
@RequiredArgsConstructor
public class CourseScheduleController {

    private final CourseScheduleService courseScheduleService;

    @PostMapping
    public ResponseEntity<ScheduleResponse> createCourseSchedule(@Valid @RequestBody ScheduleRequest request) {
        ScheduleResponse response = courseScheduleService.createSchedule(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/student")
    public ResponseEntity<List<StudentScheduleResponse>> getStudentSchedule(@RequestHeader("X-User-Id") String userId) {
        if(userId==null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        List<StudentScheduleResponse> response = courseScheduleService.getStudentSchedule(userId);
        return ResponseEntity.ok(response);
    }
}