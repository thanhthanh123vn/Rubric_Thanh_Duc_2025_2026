package hcmuaf.edu.vn.fit.user_service.controller.admin;



import hcmuaf.edu.vn.fit.user_service.client.CourseClient;
import hcmuaf.edu.vn.fit.user_service.dto.request.SystemLogRequest;
import hcmuaf.edu.vn.fit.user_service.dto.request.admin.CreateUserRequest;
import hcmuaf.edu.vn.fit.user_service.dto.request.admin.UpdateUserRequest;
import hcmuaf.edu.vn.fit.user_service.dto.response.UserResponse;
import hcmuaf.edu.vn.fit.user_service.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/user-service/admin/users")

@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;
    private final CourseClient courseClient;

    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "userId") String sortBy) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return ResponseEntity.ok(userService.getAllUsers(keyword, pageable));
    }
    @GetMapping("/admins")
    public ResponseEntity<Page<UserResponse>> getAllAdmins(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "userId") String sortBy) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return ResponseEntity.ok(userService.getAllAdmins(keyword, pageable));
    }
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Username") String userName,
            @RequestHeader("X-User-IP") String ip,
            @RequestBody CreateUserRequest request) {

        try {
            UserResponse response = userService.createUser(request);

            courseClient.writeLog(
                    SystemLogRequest.builder()
                            .level("INFO")
                            .action("CREATE_USER")
                            .message("Tạo người dùng thành công")
                            .username(userName)
                            .ip(ip)
                            .build()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            courseClient.writeLog(
                    SystemLogRequest.builder()
                            .level("ERROR")
                            .action("CREATE_USER")
                            .message("Tạo người dùng thất bại: " + e.getMessage())
                            .username(userName)
                            .ip(ip)
                            .build()
            );

            throw e;
        }
    }


    @PutMapping("/{userId}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable String userId,
            @RequestBody UpdateUserRequest request,
            HttpServletRequest httpRequest) {
        System.out.println(request);

        String username = httpRequest.getHeader("X-User-Username");
        String ip = httpRequest.getHeader("X-User-IP");

        try {
            UserResponse response = userService.updateUser(userId, request);

            courseClient.writeLog(
                    SystemLogRequest.builder()
                            .level("INFO")
                            .action("UPDATE_USER")
                            .message("Cập nhật người dùng thành công")
                            .username(username)
                            .ip(ip)
                            .build()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            courseClient.writeLog(
                    SystemLogRequest.builder()
                            .level("ERROR")
                            .action("UPDATE_USER")
                            .message("Cập nhật người dùng thất bại: " + e.getMessage())
                            .username(username)
                            .ip(ip)
                            .build()
            );

            throw e;
        }
    }


    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteUser(
            @PathVariable String userId,
            HttpServletRequest httpRequest) {

        String username = httpRequest.getHeader("X-User-Username");
        String ip = httpRequest.getHeader("X-User-IP");

        try {
            userService.deleteUser(userId);

            courseClient.writeLog(
                    SystemLogRequest.builder()
                            .level("INFO")
                            .action("DELETE_USER")
                            .message("Xóa người dùng thành công")
                            .username(username)
                            .ip(ip)
                            .build()
            );

            return ResponseEntity.ok("Xóa người dùng thành công!");

        } catch (Exception e) {

            courseClient.writeLog(
                    SystemLogRequest.builder()
                            .level("ERROR")
                            .action("DELETE_USER")
                            .message("Xóa người dùng thất bại: " + e.getMessage())
                            .username(username)
                            .ip(ip)
                            .build()
            );

            throw e;
        }
    }
}