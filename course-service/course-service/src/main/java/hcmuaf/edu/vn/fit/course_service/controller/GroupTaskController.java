package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.GroupTaskRequest;
import hcmuaf.edu.vn.fit.course_service.entity.enums.TaskStatus;
import hcmuaf.edu.vn.fit.course_service.service.GroupTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/course-service/group/tasks")
public class GroupTaskController {

    private final GroupTaskService taskService;

    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody GroupTaskRequest req, @RequestHeader("X-User-Id") String userId) {
        try {
            return ResponseEntity.ok(Map.of("status", "success", "data", taskService.createTask(req, userId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<?> getTasks(@PathVariable String groupId) {
        try {
            return ResponseEntity.ok(Map.of("status", "success", "data", taskService.getTasksByGroup(groupId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    @PutMapping("/{taskId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String taskId,
            @RequestParam TaskStatus status,
            @RequestHeader("X-User-Id") String userId) {
        try {
            return ResponseEntity.ok(Map.of("status", "success", "data", taskService.updateTaskStatus(taskId, status, userId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<?> deleteTask(@PathVariable String taskId, @RequestHeader("X-User-Id") String userId) {
        try {
            taskService.deleteTask(taskId, userId);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Đã xóa task"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}