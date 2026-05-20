package hcmuaf.edu.vn.fit.rubric_service.service;

import hcmuaf.edu.vn.fit.rubric_service.dto.request.CloRequest;
import hcmuaf.edu.vn.fit.rubric_service.entity.CourseCloEntity;
import hcmuaf.edu.vn.fit.rubric_service.entity.CourseCloMapEntity;
import hcmuaf.edu.vn.fit.rubric_service.repository.CourseCloMapRepository;
import hcmuaf.edu.vn.fit.rubric_service.repository.CourseCloRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseCloService {

    @Autowired
    private CourseCloRepository courseCloRepository;

    @Autowired
    private CourseCloMapRepository courseCloMapRepository;

    public List<CourseCloEntity> getAll() {
        return courseCloRepository.findAll();
    }

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

        if (req.getCourseId() != null && !req.getCourseId().isBlank()) {

            CourseCloMapEntity mapEntity = CourseCloMapEntity.builder()
                    .courseId(req.getCourseId())
                    .clo(savedClo)
                    .build();

            courseCloMapRepository.save(mapEntity);
        }

        return savedClo;
    }

}