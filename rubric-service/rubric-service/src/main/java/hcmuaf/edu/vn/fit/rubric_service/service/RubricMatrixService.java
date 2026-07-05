package hcmuaf.edu.vn.fit.rubric_service.service;

import hcmuaf.edu.vn.fit.rubric_service.dto.request.RubricMatrixRequest;
import hcmuaf.edu.vn.fit.rubric_service.dto.request.CriterionRequest;
import hcmuaf.edu.vn.fit.rubric_service.dto.request.DescriptorRequest;
import hcmuaf.edu.vn.fit.rubric_service.dto.request.LevelRequest;
import hcmuaf.edu.vn.fit.rubric_service.entity.CourseCloEntity;
import hcmuaf.edu.vn.fit.rubric_service.entity.Rubric;
import hcmuaf.edu.vn.fit.rubric_service.entity.RubricCriteria;
import hcmuaf.edu.vn.fit.rubric_service.entity.RubricLevel;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricCriteriaRepository;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricLevelRepository;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
public class RubricMatrixService {

    @Autowired
    private RubricRepository rubricRepository;

    @Autowired
    private RubricCriteriaRepository rubricCriteriaRepository;

    @Autowired
    private RubricLevelRepository rubricLevelRepository;


    @Transactional
    public boolean updateMatrix(RubricMatrixRequest req) {
        List<CriterionRequest> criteriaRequests =
                req.getCriteria() == null ? Collections.emptyList() : req.getCriteria();
        List<LevelRequest> levelRequests =
                req.getLevels() == null ? Collections.emptyList() : req.getLevels();
        List<DescriptorRequest> descriptorRequests =
                req.getDescriptors() == null ? Collections.emptyList() : req.getDescriptors();

        Rubric rubric = rubricRepository.findById(req.getId())
                .orElseGet(() -> {
                    Rubric r = new Rubric();
                    r.setRubricId(req.getId());
                    return r;
                });

        rubric.setRubricName(req.getName());
        rubric.setDescription(req.getDescription());

        if (rubric.getCriteria() == null) {
            rubric.setCriteria(new HashSet<>());
        }

        Set<RubricCriteria> criteriaSet = new HashSet<>();

        for (var criterionRequest : criteriaRequests) {

            RubricCriteria rubricCriteria = rubricCriteriaRepository
                    .findById(criterionRequest.getId())
                    .orElseGet(() -> {
                        RubricCriteria c = new RubricCriteria();
                        c.setCriteriaId(criterionRequest.getId());
                        return c;
                    });

            rubricCriteria.setCriteriaName(criterionRequest.getName());
            rubricCriteria.setWeight(criterionRequest.getWeight());


            rubricCriteria.setCloId(criterionRequest.getCloId());
            rubricCriteria.setRubric(rubric);

            Set<RubricLevel> levelSet = new HashSet<>();
            List<LevelRequest> criterionLevels =
                    criterionRequest.getLevels() == null || criterionRequest.getLevels().isEmpty()
                            ? levelRequests
                            : criterionRequest.getLevels();

            for (var levelRequest : criterionLevels) {
                RubricLevel rubricLevel = new RubricLevel();
                rubricLevel.setLevelId(levelRequest.getId());

                rubricLevel.setLevelName(levelRequest.getName());
                rubricLevel.setCriteria(rubricCriteria);
                rubricLevel.setScore(levelRequest.getScore() == null ? null : levelRequest.getScore().floatValue());
                rubricLevel.setDescription(levelRequest.getDescription());

                if (levelRequest.getScore() == null && levelRequest.getDescription() == null) {
                    descriptorRequests.stream()
                            .filter(d ->
                                    Objects.equals(d.getCriterionId(), criterionRequest.getId())
                                            && Objects.equals(d.getLevelId(), levelRequest.getId())
                            )
                            .findFirst()
                            .ifPresent(d -> {
                                rubricLevel.setScore(d.getScore() == null ? null : d.getScore().floatValue());
                                rubricLevel.setDescription(d.getDescription());
                            });
                }

                levelSet.add(rubricLevel);
            }

            if (rubricCriteria.getLevels() == null) {
                rubricCriteria.setLevels(new HashSet<>());
            } else {
                rubricCriteria.getLevels().clear();
            }
            rubricCriteria.getLevels().addAll(levelSet);
            criteriaSet.add(rubricCriteria);
        }

        rubric.getCriteria().clear();
        rubric.getCriteria().addAll(criteriaSet);

        rubricRepository.save(rubric);
        return true;
    }
}
