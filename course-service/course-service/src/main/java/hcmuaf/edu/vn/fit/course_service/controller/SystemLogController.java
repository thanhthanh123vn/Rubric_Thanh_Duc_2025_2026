package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.SystemLogRequest;
import hcmuaf.edu.vn.fit.course_service.entity.SystemLog;
import hcmuaf.edu.vn.fit.course_service.service.SystemLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/course-service/courses/system-logs")
@RequiredArgsConstructor
public class SystemLogController {

    private final SystemLogService systemLogService;

    @GetMapping
    public ResponseEntity<Page<SystemLog>> getLogs(
            @RequestParam(defaultValue = "") String level,
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        // Sắp xếp log mới nhất lên đầu
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return ResponseEntity.ok(systemLogService.getLogs(level, keyword, pageRequest));
    }
    @PostMapping
    public void writeLog(@RequestBody SystemLogRequest request) {
        systemLogService.writeLog(
                request.getLevel(),
                request.getAction(),
                request.getMessage(),
                request.getUsername(),
                request.getIp()
        );
    }
}