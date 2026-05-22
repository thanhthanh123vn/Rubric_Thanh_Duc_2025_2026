package hcmuaf.edu.vn.fit.rubric_service.service;

import hcmuaf.edu.vn.fit.rubric_service.dto.response.*;
import hcmuaf.edu.vn.fit.rubric_service.entity.Rubric;
import hcmuaf.edu.vn.fit.rubric_service.entity.RubricCriteria;
import hcmuaf.edu.vn.fit.rubric_service.entity.RubricLevel;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class RubricService {

    private static final Comparator<RubricLevel> LEVEL_SCORE_DESC_COMPARATOR =
            Comparator.comparing(
                    RubricLevel::getScore,
                    Comparator.nullsLast(Comparator.reverseOrder())
            ).thenComparing(
                    RubricLevel::getLevelName,
                    Comparator.nullsLast(String::compareToIgnoreCase)
            );

    @Autowired
    private RubricRepository rubricRepository;

    public List<RubricResponse> getAllRubrics() {

        List<Rubric> rubrics =
                rubricRepository.findAllByOrderByRubricNameAsc();

        return rubrics.stream()
                .map(rubric -> RubricResponse.builder()

                        .id(rubric.getRubricId())

                        .name(rubric.getRubricName())

                        .description(rubric.getDescription())

                        .totalWeight(
                                rubric.getCriteria()
                                        .stream()
                                        .map(c -> c.getWeight() == null ? 0f : c.getWeight())
                                        .reduce(0f, Float::sum)
                        )

                        .criteria(
                                rubric.getCriteria()
                                        .stream()
                                        .map(c -> CriteriaResponse.builder()
                                                .id(c.getCriteriaId())
                                                .cloId(c.getCloId())
                                                .name(c.getCriteriaName())
                                                .weight(c.getWeight())
                                                .build()
                                        )
                                        .toList()
                        )

                        .build())
                .toList();
    }
    public List<RubricMatrixResponse> getRubricMatrices() {
        List<Rubric> rubrics = rubricRepository.findAllByOrderByRubricNameAsc();

        return rubrics.stream()
                .map(this::toMatrixResponse)
                .toList();
    }

    public RubricMatrixResponse getRubricMatrixDetail(String rubricId) {
        Rubric rubric = rubricRepository
                .findWithCriteriaAndLevelsByRubricId(rubricId)
                .orElseThrow(() -> new RuntimeException("Rubric not found: " + rubricId));

        return toMatrixResponse(rubric);
    }

    private RubricMatrixResponse toMatrixResponse(Rubric rubric) {
        List<RubricCriteria> criteriaList =
                rubric.getCriteria() == null ? List.of() : rubric.getCriteria().stream().toList();

        Float totalWeight = criteriaList.stream()
                .map(c -> c.getWeight() == null ? 0f : c.getWeight())
                .reduce(0f, Float::sum);

        long cloCount = criteriaList.stream()
                .map(RubricCriteria::getCloId)
                .filter(Objects::nonNull)
                .distinct()
                .count();

        List<RubricMatrixRowResponse> rows = criteriaList.stream()
                .map(c -> RubricMatrixRowResponse.builder()
                        .cloId(c.getCloId())
                        .criteriaId(c.getCriteriaId())
                        .criteriaName(c.getCriteriaName())
                        .weight(c.getWeight())
                        .levels(
                                c.getLevels() == null ? List.of() :
                                        c.getLevels().stream()
                                                .sorted(LEVEL_SCORE_DESC_COMPARATOR)
                                                .map(l -> RubricLevelResponse.builder()
                                                        .levelId(l.getLevelId())
                                                        .levelName(l.getLevelName())
                                                        .description(l.getDescription())
                                                        .score(l.getScore())
                                                        .build()
                                                )
                                                .toList()
                        )
                        .build()
                )
                .toList();

        return RubricMatrixResponse.builder()
                .id(rubric.getRubricId())
                .name(rubric.getRubricName())
                .description(rubric.getDescription())
                .courses(0)
                .cloCount((int) cloCount)
                .criteriaCount(criteriaList.size())
                .totalWeight(totalWeight)
                .status(totalWeight >= 100 ? "Hoàn tất" : "Chưa hoàn tất")
                .rows(rows)
                .build();
    }

    public Rubric getById(String id) {
        return rubricRepository.findById(id).orElse(null);
    }

    public Rubric create(Rubric rubric) {
        return rubricRepository.save(rubric);
    }

    public void delete(String id) {
        rubricRepository.deleteById(id);
    }
}
