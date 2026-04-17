package hcmuaf.edu.vn.fit.user_service.map;

import hcmuaf.edu.vn.fit.user_service.dto.request.RegisterRequest;

import hcmuaf.edu.vn.fit.user_service.dto.response.UserResponse;
import hcmuaf.edu.vn.fit.user_service.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {


    @Mapping(target = "userId", source = "Id")
    @Mapping(target = "username", source = "Id")
    @Mapping(target = "passwordHash", ignore = true)
    User toUser(RegisterRequest request);

    UserResponse toUserResponse(User user);
}