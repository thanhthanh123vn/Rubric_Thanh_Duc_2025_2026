package hcmuaf.edu.vn.fit.user_service.dto.response;

import hcmuaf.edu.vn.fit.user_service.entity.SinhVien;
import lombok.Builder;

@Builder
public record LoginResponse(
        String token,
        String studentId,
        String userName,
        String role,
       String fullname

) {}