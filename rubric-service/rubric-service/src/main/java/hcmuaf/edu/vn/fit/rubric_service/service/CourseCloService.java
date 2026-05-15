package hcmuaf.edu.vn.fit.rubric_service.service;

import hcmuaf.edu.vn.fit.rubric_service.dto.request.CloRequest;
import hcmuaf.edu.vn.fit.rubric_service.entity.CourseCloEntity;
import hcmuaf.edu.vn.fit.rubric_service.repository.CourseCloRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseCloService {

    @Autowired
    private CourseCloRepository courseCloRepository;

    public List<CourseCloEntity> getAll(){
        return courseCloRepository.findAll();
    }

    public CourseCloEntity createClo(CloRequest req) {


        courseCloRepository.findByCloCode(req.getCloCode())
                .ifPresent(clo -> {
                    throw new RuntimeException("Mã CLO đã tồn tại");
                });

        CourseCloEntity courseCloEntity = new CourseCloEntity();

        courseCloEntity.setCloName(req.getCloName());
        courseCloEntity.setCloCode(req.getCloCode());
        courseCloEntity.setDescription(req.getDescription());
        courseCloEntity.setBloomLevel(req.getBloomLevel());
        if(req.getCourseId() != null && !req.getCourseId().isEmpty()){
            courseCloEntity.setCourseId(req.getCourseId());
        }
        return courseCloRepository.save(courseCloEntity);
    }
}
