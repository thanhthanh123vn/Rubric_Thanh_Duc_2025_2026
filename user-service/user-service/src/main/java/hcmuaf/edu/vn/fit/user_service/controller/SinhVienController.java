
package hcmuaf.edu.vn.fit.user_service.controller;

import hcmuaf.edu.vn.fit.user_service.dto.request.UpdateProfileRequest;
import hcmuaf.edu.vn.fit.user_service.dto.response.ProfileResponse;
import hcmuaf.edu.vn.fit.user_service.service.SinhVienService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sinhvien")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SinhVienController {

    private final SinhVienService sinhVienService;

    @PutMapping("/profile/{studentId}")
    public ResponseEntity<?> updateProfile(
            @PathVariable String studentId,
            @RequestBody UpdateProfileRequest request) {

        return ResponseEntity.ok(sinhVienService.updateProfile(studentId, request));
    }
    @GetMapping("/profile/{studentId}")
    public ResponseEntity<ProfileResponse> getProfile(@PathVariable String studentId) {
        return ResponseEntity.ok(sinhVienService.getProfile(studentId));
    }



}