package hcmuaf.edu.vn.fit.user_service.map;

import hcmuaf.edu.vn.fit.user_service.dto.request.RegisterRequest;
import hcmuaf.edu.vn.fit.user_service.dto.response.UserResponse;
import hcmuaf.edu.vn.fit.user_service.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // MapStruct tự generate implementation cho mapping này
    @Mapping(target = "userId", source = "studentId")
    @Mapping(target = "username", source = "studentId")
    @Mapping(target = "passwordHash", ignore = true)
    User toUser(RegisterRequest request);

    // Phải thêm 'default' nếu bạn viết body trong interface
    default UserResponse toUserResponse(User user) {
        if (user == null) return null;

        return new UserResponse(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getAuthProvider()
        );
    }
}