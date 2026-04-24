package hcmuaf.edu.vn.fit.user_service.dto.response;

import hcmuaf.edu.vn.fit.user_service.entity.SinhVien;
import lombok.Builder;

@Builder
public record LoginResponse(
        String token,
        String role,
        String userId,
        String avatarUrl,
        StudentProfileResponse student,
        LecturerProfileResponse lecturer,
        String refreshToken
) {}