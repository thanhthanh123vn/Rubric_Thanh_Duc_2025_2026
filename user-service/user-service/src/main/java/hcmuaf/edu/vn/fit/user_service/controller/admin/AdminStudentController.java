package hcmuaf.edu.vn.fit.user_service.controller.admin;

import hcmuaf.edu.vn.fit.user_service.dto.request.UpdateProfileRequest;
import hcmuaf.edu.vn.fit.user_service.service.SinhVienService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/user-service/admin/student")
public class AdminStudentController {
    private final SinhVienService sinhVienService;


//        @GetMapping
//        public ResponseEntity<?> getAllStudents() {
//            return ResponseEntity.ok(sinhVienService.getAllStudents());
//        }
//
//        @GetMapping("/{studentId}")
//        public ResponseEntity<?> getStudent(@PathVariable String studentId) {
//            return ResponseEntity.ok(sinhVienService.getStudent(studentId));
//        }

        @PostMapping
        public ResponseEntity<?> createStudent(
                @RequestHeader("X-User-Id") String userId,
                @RequestBody UpdateProfileRequest request) {
            if(userId==null)
                return  ResponseEntity.badRequest().build();

            return ResponseEntity.ok(sinhVienService.createStudent(request));
        }



        @DeleteMapping("/{studentId}")
        public ResponseEntity<?> deleteStudent(
                @PathVariable String studentId) {

            sinhVienService.deleteSinhVien(studentId);
            return ResponseEntity.ok("Xóa sinh viên thành công");
        }

        @PutMapping("/profile/me")
        public ResponseEntity<?> updateProfile(
                @RequestHeader("X-User-Id") String userId,
                @RequestBody UpdateProfileRequest request) {

            return ResponseEntity.ok(
                    sinhVienService.updateProfileSinhVien(userId, request)
            );
        }

}
