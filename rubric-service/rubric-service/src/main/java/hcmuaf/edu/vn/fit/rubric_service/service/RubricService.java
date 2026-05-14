package hcmuaf.edu.vn.fit.rubric_service.service;

import hcmuaf.edu.vn.fit.rubric_service.dto.response.RubricResponse;
import hcmuaf.edu.vn.fit.rubric_service.entity.Rubric;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RubricService {

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
                                        .map(c -> c.getCriteriaName())
                                        .toList()
                        )

                        .build())
                .toList();
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