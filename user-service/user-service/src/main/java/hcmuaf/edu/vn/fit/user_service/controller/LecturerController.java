package hcmuaf.edu.vn.fit.user_service.controller;

import hcmuaf.edu.vn.fit.user_service.dto.request.UpdateLecturerProfileRequest;
import hcmuaf.edu.vn.fit.user_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.user_service.dto.response.ProfileResponse;
import hcmuaf.edu.vn.fit.user_service.map.UserMapper;
import hcmuaf.edu.vn.fit.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user-service/lecturer")
@RequiredArgsConstructor
public class LecturerController {
    private final UserService userService;



    @GetMapping("/lecturers")
    public ResponseEntity<Page<LecturerResponse>> getAllLecturers(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "lecturerId") String sortBy) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<LecturerResponse> response = userService.getAllLecturers(keyword, pageable);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/{lecturerId}/user-id")
    public ResponseEntity<String> getUserIdByLecturerId(@PathVariable String lecturerId) {

        String userId = userService.findUserIdByLecturerId(lecturerId);
        return ResponseEntity.ok(userId);
    }
    @GetMapping("/count/{departmentName}")
    public ResponseEntity<Long> getLecturerCount(@RequestHeader("X-User-ID") String userId,@PathVariable String departmentName) {
        if(userId==null){
            return ResponseEntity.badRequest().body(0L);
        }


       Long totalLecturer = userService.countLecturers(departmentName);

        return ResponseEntity.ok(totalLecturer);




    }

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
    @GetMapping("/profile/me")
    public ResponseEntity<LecturerResponse> getProfile( @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(userService.getProfile(userId));
    }
    @PutMapping("/profile/me")
    public ResponseEntity<LecturerResponse> updateProfile(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody UpdateLecturerProfileRequest request) {

        LecturerResponse updatedProfile = userService.updateProfile(userId, request);
        return ResponseEntity.ok(updatedProfile);
    }
    @GetMapping("/department/{departmentName}")
    public ResponseEntity<List<LecturerResponse>> getLecturersByDepartment(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable String departmentName) {

        if(userId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<LecturerResponse> lecturers = userService.getLecturersByDepartment(departmentName);
        return ResponseEntity.ok(lecturers);
    }
}
