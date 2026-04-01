package hcmuaf.edu.vn.fit.user_service.map;


import hcmuaf.edu.vn.fit.user_service.dto.request.RegisterRequest;
import hcmuaf.edu.vn.fit.user_service.entity.SinhVien;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SinhVienMapper {

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "studentId", source = "studentId")
    @Mapping(target = "fullName", source = "fullName")
    SinhVien toEntity(RegisterRequest request);
}