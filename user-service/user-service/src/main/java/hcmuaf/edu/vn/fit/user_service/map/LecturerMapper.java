package hcmuaf.edu.vn.fit.user_service.map;

import hcmuaf.edu.vn.fit.user_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.user_service.entity.Lecturer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LecturerMapper {
    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "title" , source = "academicTitle")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "department.departmentName" , target="department")
    LecturerResponse toResponse(Lecturer lecturer);
    @Mapping(target = "department.departmentName" , source="department")
    Lecturer toEntity(LecturerResponse response);
}