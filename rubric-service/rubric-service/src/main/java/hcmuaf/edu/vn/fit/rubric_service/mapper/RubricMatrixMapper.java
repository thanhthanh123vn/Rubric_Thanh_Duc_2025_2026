package hcmuaf.edu.vn.fit.rubric_service.mapper;

import hcmuaf.edu.vn.fit.rubric_service.dto.response.RubricLevelResponse;
import hcmuaf.edu.vn.fit.rubric_service.dto.response.RubricMatrixResponse;
import hcmuaf.edu.vn.fit.rubric_service.dto.response.RubricMatrixRowResponse;
import hcmuaf.edu.vn.fit.rubric_service.entity.Rubric;
import hcmuaf.edu.vn.fit.rubric_service.entity.RubricCriteria;
import hcmuaf.edu.vn.fit.rubric_service.entity.RubricLevel;

import java.util.List;
import java.util.Objects;

public class RubricMatrixMapper {

    public static RubricMatrixResponse toResponse(Rubric rubric) {

        List<RubricCriteria> criteriaList =
                rubric.getCriteria() == null
                        ? List.of()
                        : rubric.getCriteria()
                        .stream()
                        .toList();

        Float totalWeight = criteriaList.stream()
                .map(c -> c.getWeight() == null ? 0f : c.getWeight())
                .reduce(0f, Float::sum);

        long cloCount = criteriaList.stream()
                .map(RubricCriteria::getCloId)
                .filter(Objects::nonNull)
                .distinct()
                .count();

        List<RubricMatrixRowResponse> rows = criteriaList.stream()
                .map(RubricMatrixMapper::toRowResponse)
                .toList();

        return RubricMatrixResponse.builder()
                .id(rubric.getRubricId())
                .name(rubric.getRubricName())
                .description(rubric.getDescription())

                // TODO: sau này count theo course_offerings hoặc assessments
                .courses(0)

                .cloCount((int) cloCount)
                .criteriaCount(criteriaList.size())
                .totalWeight(totalWeight)

                .status(
                        totalWeight >= 100
                                ? "Hoàn tất"
                                : "Chưa hoàn tất"
                )

                .rows(rows)
                .build();
    }

    public static RubricMatrixRowResponse toRowResponse(RubricCriteria criteria) {

        List<RubricLevelResponse> levels =
                criteria.getLevels() == null
                        ? List.of()
                        : criteria.getLevels()
                        .stream()
                        .map(RubricMatrixMapper::toLevelResponse)
                        .toList();

        return RubricMatrixRowResponse.builder()
                .cloId(criteria.getCloId())
                .criteriaId(criteria.getCriteriaId())
                .criteriaName(criteria.getCriteriaName())
                .weight(criteria.getWeight())
                .levels(levels)
                .build();
    }

    public static RubricLevelResponse toLevelResponse(RubricLevel level) {

        return RubricLevelResponse.builder()
                .levelId(level.getLevelId())
                .levelName(level.getLevelName())
                .description(level.getDescription())
                .score(level.getScore())
                .build();
    }
}