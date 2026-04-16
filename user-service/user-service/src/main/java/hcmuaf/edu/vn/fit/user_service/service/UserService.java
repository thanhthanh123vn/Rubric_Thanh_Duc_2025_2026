package hcmuaf.edu.vn.fit.user_service.service;


import hcmuaf.edu.vn.fit.user_service.dto.request.admin.CreateUserRequest;
import hcmuaf.edu.vn.fit.user_service.dto.request.admin.UpdateUserRequest;
import hcmuaf.edu.vn.fit.user_service.dto.response.UserResponse;
import hcmuaf.edu.vn.fit.user_service.entity.User;
import hcmuaf.edu.vn.fit.user_service.map.UserMapper;
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

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final UserMapper userMapper;


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
        return  userMapper.toUserResponse(user);
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

    public Map<String,UserResponse> getUsers(List<String> ids){
        List<User>  users = userRepository.findAllById(ids);

        return users.stream()
                .collect(Collectors.toMap(
                        User::getUserId,
                        userMapper::toUserResponse
                ));
    }


    @Transactional
    public void deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("Không tìm thấy người dùng để xóa!");
        }

        userRepository.deleteById(userId);
    }



}