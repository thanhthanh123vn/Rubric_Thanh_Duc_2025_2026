package hcmuaf.edu.vn.fit.rubric_service.service;

import hcmuaf.edu.vn.fit.rubric_service.dto.request.CloRequest;
import hcmuaf.edu.vn.fit.rubric_service.entity.CourseCloEntity;
import hcmuaf.edu.vn.fit.rubric_service.entity.CourseCloMapEntity;
import hcmuaf.edu.vn.fit.rubric_service.repository.CourseCloMapRepository;
import hcmuaf.edu.vn.fit.rubric_service.repository.CourseCloRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class CourseCloService {

    @Autowired
    private CourseCloRepository courseCloRepository;

    @Autowired
    private CourseCloMapRepository courseCloMapRepository;

    public List<CourseCloEntity> getAll() {
        return courseCloRepository.findAll();
    }

    @Transactional
    public CourseCloEntity createClo(CloRequest req) {

        courseCloRepository.findByCloCode(req.getCloCode())
                .ifPresent(clo -> {
                    throw new RuntimeException("Mã CLO đã tồn tại");
                });


        CourseCloEntity courseCloEntity = CourseCloEntity.builder()
                .cloCode(req.getCloCode())
                .cloName(req.getCloName())
                .description(req.getDescription())
                .bloomLevel(req.getBloomLevel())
                .build();

        CourseCloEntity savedClo = courseCloRepository.save(courseCloEntity);
        syncCourseMappings(savedClo, extractCourseIds(req));

        return courseCloRepository.findById(savedClo.getCloId()).orElse(savedClo);
    }

    @Transactional
    public CourseCloEntity updateClo(String cloId, CloRequest req) {
        CourseCloEntity existingClo = courseCloRepository.findById(cloId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy CLO"));

        courseCloRepository.findByCloCodeAndCloIdNot(req.getCloCode(), cloId)
                .ifPresent(clo -> {
                    throw new RuntimeException("Mã CLO đã tồn tại");
                });

        existingClo.setCloCode(req.getCloCode());
        existingClo.setCloName(req.getCloName());
        existingClo.setDescription(req.getDescription());
        existingClo.setBloomLevel(req.getBloomLevel());

        CourseCloEntity savedClo = courseCloRepository.save(existingClo);
        syncCourseMappings(savedClo, extractCourseIds(req));

        return courseCloRepository.findById(savedClo.getCloId()).orElse(savedClo);
    }

    private List<String> extractCourseIds(CloRequest req) {
        List<String> courseIds = new ArrayList<>();

        if (req.getCourseIds() != null) {
            courseIds.addAll(req.getCourseIds());
        }

        if (req.getCourseId() != null && !req.getCourseId().isBlank()) {
            courseIds.add(req.getCourseId());
        }

        return courseIds.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(courseId -> !courseId.isBlank())
                .distinct()
                .toList();
    }

    private void syncCourseMappings(CourseCloEntity clo, List<String> courseIds) {
        courseCloMapRepository.deleteByClo_CloId(clo.getCloId());

        if (courseIds.isEmpty()) {
            return;
        }

        List<CourseCloMapEntity> mappingEntities = courseIds.stream()
                .map(courseId -> CourseCloMapEntity.builder()
                        .courseId(courseId)
                        .clo(clo)
                        .build())
                .toList();

        courseCloMapRepository.saveAll(mappingEntities);
    }
}
