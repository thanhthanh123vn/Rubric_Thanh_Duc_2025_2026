package hcmuaf.edu.vn.fit.user_service.controller;

import hcmuaf.edu.vn.fit.user_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user-service/lecturer")
@RequiredArgsConstructor
public class LecturerController {
    private final UserService userService;

    @GetMapping("/lecturers/{lecturerId}")
    public ResponseEntity<LecturerResponse> getLecturerById(@PathVariable String lecturerId) {

        LecturerResponse response = userService.getLecturerById(lecturerId);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/lecturers/by-user/{userId}")
    public ResponseEntity<LecturerResponse> getLecturerByUserId(@PathVariable String userId) {
        LecturerResponse response = userService.getLecturerByUserId(userId);
        return ResponseEntity.ok(response);
    }
}
