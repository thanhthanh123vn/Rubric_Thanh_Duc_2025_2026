package hcmuaf.edu.vn.fit.rubric_service.service;

import hcmuaf.edu.vn.fit.rubric_service.dto.request.CloRequest;
import hcmuaf.edu.vn.fit.rubric_service.entity.CourseCloEntity;
import hcmuaf.edu.vn.fit.rubric_service.repository.CourseCloRepository;
import hcmuaf.edu.vn.fit.rubric_service.repository.CourseCloMappingCleanupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseCloService {

    private final CourseCloRepository courseCloRepository;
    private final CourseCloMappingCleanupRepository mappingCleanupRepository;

    public List<CourseCloEntity> getAll() {
        return courseCloRepository.findAll();
    }

    public List<CourseCloEntity> getByCourseId(String courseId) {
        return courseCloRepository.findByCourseIdOrderByCloCodeAsc(requireCourseId(courseId));
    }

    public CourseCloEntity getById(String cloId) {
        return courseCloRepository.findById(cloId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy CLO"));
    }

    @Transactional
    public CourseCloEntity createClo(CloRequest request) {
        String courseId = requireCourseId(request.getCourseId());
        String cloCode = requireCloCode(request.getCloCode());

        courseCloRepository.findByCourseIdAndCloCode(courseId, cloCode)
                .ifPresent(clo -> {
                    throw new RuntimeException("Mã CLO đã tồn tại trong khóa học này");
                });

        CourseCloEntity clo = CourseCloEntity.builder()
                .courseId(courseId)
                .cloCode(cloCode)
                .cloName(requireCloName(request.getCloName()))
                .description(request.getDescription())
                .bloomLevel(request.getBloomLevel())
                .build();

        return courseCloRepository.save(clo);
    }

    @Transactional
    public CourseCloEntity updateClo(String cloId, CloRequest request) {
        CourseCloEntity existingClo = getById(cloId);
        requireEditable(existingClo);
        String courseId = requireCourseId(request.getCourseId());
        String cloCode = requireCloCode(request.getCloCode());

        if (!courseId.equals(existingClo.getCourseId())) {
            throw new RuntimeException("Không thể chuyển CLO sang khóa học khác");
        }

        courseCloRepository.findByCourseIdAndCloCodeAndCloIdNot(courseId, cloCode, cloId)
                .ifPresent(clo -> {
                    throw new RuntimeException("Mã CLO đã tồn tại trong khóa học này");
                });

        existingClo.setCloCode(cloCode);
        existingClo.setCloName(requireCloName(request.getCloName()));
        existingClo.setDescription(request.getDescription());
        existingClo.setBloomLevel(request.getBloomLevel());
        return courseCloRepository.save(existingClo);
    }

    @Transactional
    public void deleteClo(String cloId) {
        CourseCloEntity clo = getById(cloId);
        requireEditable(clo);
        mappingCleanupRepository.deletePloMappings(cloId);
        courseCloRepository.delete(clo);
    }

    private void requireEditable(CourseCloEntity clo) {
        if ("PENDING_REVIEW".equals(clo.getApprovalStatus()) || "APPROVED".equals(clo.getApprovalStatus())) {
            throw new IllegalStateException("Không thể chỉnh sửa CLO đang chờ duyệt hoặc đã duyệt.");
        }
        if ("REJECTED".equals(clo.getApprovalStatus())) {
            clo.setApprovalStatus("DRAFT");
            clo.setRejectionReason(null);
        }
    }

    private String requireCourseId(String courseId) {
        if (courseId == null || courseId.isBlank()) {
            throw new IllegalArgumentException("CLO phải thuộc một khóa học");
        }
        return courseId.trim();
    }

    private String requireCloCode(String cloCode) {
        if (cloCode == null || cloCode.isBlank()) {
            throw new IllegalArgumentException("Mã CLO không được để trống");
        }
        return cloCode.trim().toUpperCase();
    }

    private String requireCloName(String cloName) {
        if (cloName == null || cloName.isBlank()) {
            throw new IllegalArgumentException("Tên CLO không được để trống");
        }
        return cloName.trim();
    }
}
