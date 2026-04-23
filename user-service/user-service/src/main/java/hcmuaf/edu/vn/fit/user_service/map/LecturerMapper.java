package hcmuaf.edu.vn.fit.user_service.map;

import hcmuaf.edu.vn.fit.user_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.user_service.entity.Lecturer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LecturerMapper {
    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "title" , source = "academicTitle")

    LecturerResponse toResponse(Lecturer lecturer);

    Lecturer toEntity(LecturerResponse response);
}