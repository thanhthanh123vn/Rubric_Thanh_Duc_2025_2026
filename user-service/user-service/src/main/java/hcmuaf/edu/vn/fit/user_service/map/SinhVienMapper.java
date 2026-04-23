package hcmuaf.edu.vn.fit.user_service.map;


import hcmuaf.edu.vn.fit.user_service.dto.request.RegisterRequest;
import hcmuaf.edu.vn.fit.user_service.dto.request.UpdateProfileRequest;
import hcmuaf.edu.vn.fit.user_service.entity.SinhVien;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SinhVienMapper {

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "studentId", source = "Id")
    @Mapping(target = "fullName", source = "fullName")
    SinhVien toEntity(RegisterRequest request);

    @Mapping(target = "studentId", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "className", ignore = true)
    @Mapping(target = "major", ignore = true)
    void updateSinhVienFromRequest(UpdateProfileRequest request, @MappingTarget SinhVien sinhVien);
}