package hcmuaf.edu.vn.fit.user_service.service;

import hcmuaf.edu.vn.fit.user_service.dto.request.UpdateProfileRequest;
import hcmuaf.edu.vn.fit.user_service.dto.response.ProfileResponse;
import hcmuaf.edu.vn.fit.user_service.entity.SinhVien;
import hcmuaf.edu.vn.fit.user_service.map.SinhVienMapper;
import hcmuaf.edu.vn.fit.user_service.repository.SinhVienRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SinhVienService {
    private final SinhVienRepository sinhVienRepository;
    private final SinhVienMapper svMapper;


    public Page<ProfileResponse> getAllSinhVien(String keyword, Pageable pageable) {
        Page<SinhVien> sinhVienPage;


        if (keyword != null && !keyword.trim().isEmpty()) {
            sinhVienPage = sinhVienRepository.searchByKeyword(keyword.trim(), pageable);
        } else {
            sinhVienPage = sinhVienRepository.findAll(pageable);
        }

        return sinhVienPage.map(this::mapToProfileResponse);
    }


    @Transactional
    public SinhVien updateProfile(String studentId, UpdateProfileRequest request) {
        SinhVien sv = sinhVienRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên với mã: " + studentId));

        svMapper.updateSinhVienFromRequest(request, sv);
        return sinhVienRepository.save(sv);
    }


    public ProfileResponse getProfile(String studentId) {
        SinhVien sv = sinhVienRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên"));

        return mapToProfileResponse(sv);
    }


    @Transactional
    public void deleteSinhVien(String studentId) {
        if (!sinhVienRepository.existsById(studentId)) {
            throw new RuntimeException("Không tìm thấy sinh viên với mã: " + studentId);
        }
        sinhVienRepository.deleteById(studentId);
    }


    private ProfileResponse mapToProfileResponse(SinhVien sv) {
        String email = (sv.getUser() != null && sv.getUser().getEmail() != null)
                ? sv.getUser().getEmail()
                : sv.getStudentId() + "@st.hcmuaf.edu.vn";

        return ProfileResponse.builder()
                .studentId(sv.getStudentId())
                .fullName(sv.getFullName())
                .className(sv.getClassName())
                .major(sv.getMajor())
                .dateOfBirth(sv.getDateOfBirth())
                .nationality(sv.getNationality())
                .cccd(sv.getCccd())
                .gender(sv.getGender())
                .phoneNumber(sv.getPhoneNumber())
                .address(sv.getAddress())
                .email(email)
                .build();
    }
}