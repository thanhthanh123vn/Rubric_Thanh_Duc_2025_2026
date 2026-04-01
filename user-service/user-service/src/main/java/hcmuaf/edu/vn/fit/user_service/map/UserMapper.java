package hcmuaf.edu.vn.fit.user_service.map;

import hcmuaf.edu.vn.fit.user_service.dto.request.RegisterRequest;
import hcmuaf.edu.vn.fit.user_service.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // Thêm dòng Mapping này để MapStruct biết lấy studentId gắn vào userId
    @Mapping(target = "userId", source = "studentId")
    @Mapping(target = "username", source = "studentId")
    @Mapping(target = "passwordHash", ignore = true)
    User toUser(RegisterRequest request);
}