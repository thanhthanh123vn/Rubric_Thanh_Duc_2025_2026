
package hcmuaf.edu.vn.fit.user_service.controller;

import hcmuaf.edu.vn.fit.user_service.dto.request.UpdateProfileRequest;
import hcmuaf.edu.vn.fit.user_service.dto.response.ProfileResponse;
import hcmuaf.edu.vn.fit.user_service.service.SinhVienService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/user-service/sinhvien")
@RequiredArgsConstructor

public class SinhVienController {

    private final SinhVienService sinhVienService;




    @PutMapping("/profile/me")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody UpdateProfileRequest request) {

        return ResponseEntity.ok(sinhVienService.updateProfile(userId, request));
    }
    @GetMapping("/profile/me")
    public ResponseEntity<ProfileResponse> getProfile( @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(sinhVienService.getProfile(userId));
    }

    @GetMapping
    public ResponseEntity<Page<ProfileResponse>> getAllSinhVien(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "studentId") String sortBy) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return ResponseEntity.ok(sinhVienService.getAllSinhVien(keyword, pageable));
    }

}