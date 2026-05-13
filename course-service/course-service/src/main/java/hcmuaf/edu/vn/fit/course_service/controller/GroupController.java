package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.GroupRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.GroupResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Group;
import hcmuaf.edu.vn.fit.course_service.entity.enums.ParticipantRole;
import hcmuaf.edu.vn.fit.course_service.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/course-service")

public class GroupController {
    private final GroupService groupService;
    @PostMapping("/group/create")
    public ResponseEntity<?> createGroup(@RequestBody GroupRequest req) {
        try {
            GroupResponse createdGroup = groupService.createGroup(req);

            // Trả về JSON thông báo thành công
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Đã tạo nhóm thành công");
            response.put("data", createdGroup);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    @GetMapping("/group/offering/{offeringId}/user/me")
    public ResponseEntity<?> getMyGroups(
            @PathVariable String offeringId,
            @RequestHeader("X-User-Id") String userId) {
        try {

            List<GroupResponse> myGroups = groupService.getMyGroups(offeringId, userId);


            return ResponseEntity.ok(myGroups);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi tải danh sách nhóm của sinh viên: " + e.getMessage());
        }
    }
    @PostMapping("/group/{groupId}/members")
    public ResponseEntity<?> addMember(
            @PathVariable String groupId,
            @RequestParam String memberId,
            @RequestHeader("X-User-Id") String requesterId) {
        try {
            GroupResponse updatedGroup = groupService.addMember(groupId, memberId, requesterId);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Đã thêm thành viên",
                    "data", updatedGroup // Trả về GroupResponse mới nhất
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    @DeleteMapping("/group/{groupId}/members/{memberId}")
    public ResponseEntity<?> removeMember(
            @PathVariable String groupId,
            @PathVariable String memberId,
            @RequestHeader("X-User-Id") String requesterId) {
        try {
            GroupResponse updatedGroup = groupService.removeMember(groupId, memberId, requesterId);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Đã xóa thành viên",
                    "data", updatedGroup
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    @PutMapping("/group/{groupId}/members/{memberId}/role")
    public ResponseEntity<?> changeRole(
            @PathVariable String groupId,
            @PathVariable String memberId,
            @RequestParam ParticipantRole role,
            @RequestHeader("X-User-Id") String requesterId) {
        try {
            GroupResponse updatedGroup = groupService.changeMemberRole(groupId, memberId, role, requesterId);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Đã cập nhật quyền",
                    "data", updatedGroup
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}
