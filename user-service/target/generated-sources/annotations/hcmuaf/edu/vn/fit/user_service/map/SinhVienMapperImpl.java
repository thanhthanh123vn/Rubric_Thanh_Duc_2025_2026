package hcmuaf.edu.vn.fit.user_service.map;

import hcmuaf.edu.vn.fit.user_service.dto.request.RegisterRequest;
import hcmuaf.edu.vn.fit.user_service.entity.SinhVien;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-31T16:47:18+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 23.0.1 (Oracle Corporation)"
)
@Component
public class SinhVienMapperImpl implements SinhVienMapper {

    @Override
    public SinhVien toEntity(RegisterRequest request) {
        if ( request == null ) {
            return null;
        }

        SinhVien.SinhVienBuilder sinhVien = SinhVien.builder();

        sinhVien.studentId( request.studentId() );
        sinhVien.fullName( request.fullName() );

        return sinhVien.build();
    }
}
