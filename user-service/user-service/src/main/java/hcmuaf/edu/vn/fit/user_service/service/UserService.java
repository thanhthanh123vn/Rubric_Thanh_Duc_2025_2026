package hcmuaf.edu.vn.fit.user_service.service;


import hcmuaf.edu.vn.fit.user_service.dto.request.admin.CreateUserRequest;

import hcmuaf.edu.vn.fit.user_service.dto.request.admin.UpdateUserRequest;
import hcmuaf.edu.vn.fit.user_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.user_service.dto.response.UserResponse;
import hcmuaf.edu.vn.fit.user_service.entity.Lecturer;
import hcmuaf.edu.vn.fit.user_service.entity.SinhVien;
import hcmuaf.edu.vn.fit.user_service.entity.User;
import hcmuaf.edu.vn.fit.user_service.map.LecturerMapper;
import hcmuaf.edu.vn.fit.user_service.map.UserMapper;
import hcmuaf.edu.vn.fit.user_service.repository.LecturerRepository;
import hcmuaf.edu.vn.fit.user_service.repository.SinhVienRepository;
import hcmuaf.edu.vn.fit.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final LecturerRepository lecturerRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final SinhVienRepository svRepository;
    private final LecturerMapper lecturerMapper;

    public Page<UserResponse> getAllUsers(String keyword, Pageable pageable) {
        Page<User> users;
        if (keyword != null && !keyword.isEmpty()) {
            users = userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(keyword, keyword, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        return users.map(userMapper::toUserResponse);
    }


    public UserResponse getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));
        String fullName = "";
        if ("STUDENT".equals(user.getRole())) {

            svRepository.findByUser(user).ifPresent(sv -> {

            });


            SinhVien sv = svRepository.findByUser(user).orElse(null);
            if (sv != null) {
                fullName = sv.getFullName();
            }
        }

        UserResponse userResponse = new UserResponse(
                user.getUserId(),user.getUsername(),user.getEmail(),user.getRole(),
                user.getAuthProvider(),fullName
        );



        return userResponse;
    }


    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsById(request.userId())) {
            throw new RuntimeException("ID người dùng (MSSV/MGV) đã tồn tại!");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        User user = User.builder()
                .userId(request.userId())
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role() != null ? request.role().toUpperCase() : "STUDENT")
                .authProvider("LOCAL")
                .build();

        User savedUser = userRepository.save(user);
        return  userMapper.toUserResponse(savedUser);
    }


    @Transactional
    public UserResponse updateUser(String userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));


        if (request.email() != null && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new RuntimeException("Email đã tồn tại trong hệ thống!");
            }
            user.setEmail(request.email());
        }

        if (request.username() != null) {
            user.setUsername(request.username());
        }
        if (request.role() != null) {
            user.setRole(request.role().toUpperCase());
        }

        User updatedUser = userRepository.save(user);
        return userMapper.toUserResponse(updatedUser);
    }


    @Transactional
    public void deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("Không tìm thấy người dùng để xóa!");
        }

        userRepository.deleteById(userId);
    }


    public Map<String, UserResponse> getUsers(List<String> ids) {
        List<User> users = userRepository.findAllById(ids);

        return users.stream()
                .collect(Collectors.toMap(
                        User::getUserId,
                        userMapper::toUserResponse
                ));
    }
    public LecturerResponse getLecturerById(String lecturerId) {

        Lecturer lecturer = lecturerRepository.findById(lecturerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên với ID: " + lecturerId));


        String userId = null;
        String fullName = null;
        String email = null;

        if (lecturer.getUser() != null) {
            userId = lecturer.getUser().getUserId();
            fullName = lecturer.getFullName();
            email = lecturer.getUser().getEmail();
        }


        return new LecturerResponse(
                lecturer.getLecturerId(),
                userId,
                fullName,
                email,
                lecturer.getDepartment(),
                lecturer.getAcademicTitle()
        );
    }
    public LecturerResponse getLecturerByUserId(String userId) {
        Lecturer lecturer = lecturerRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new RuntimeException("Lecturer not found"));

        return lecturerMapper.toResponse(lecturer);
    }
}