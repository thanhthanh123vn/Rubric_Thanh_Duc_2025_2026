package hcmuaf.edu.vn.fit.rubric_service.controller;

import hcmuaf.edu.vn.fit.rubric_service.dto.response.RubricMatrixResponse;
import hcmuaf.edu.vn.fit.rubric_service.dto.response.RubricResponse;
import hcmuaf.edu.vn.fit.rubric_service.entity.Rubric;
import hcmuaf.edu.vn.fit.rubric_service.service.RubricService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rubric-service/rubrics")
public class RubricController {

    @Autowired
    private RubricService rubricService;

    @GetMapping
    public List<RubricResponse> getAll() {
        return rubricService.getAllRubrics();
    }
    @GetMapping("/matrix")
    public ResponseEntity<List<RubricMatrixResponse>> getRubricMatrices() {
        return ResponseEntity.ok(rubricService.getRubricMatrices());
    }

    @GetMapping("/matrix/{rubricId}")
    public ResponseEntity<RubricMatrixResponse> getRubricMatrixDetail(
            @PathVariable String rubricId
    ) {
        return ResponseEntity.ok(rubricService.getRubricMatrixDetail(rubricId));
    }

    @GetMapping("/{id}")
    public Rubric getById(@PathVariable String id) {
        return rubricService.getById(id);
    }

    @PostMapping
    public Rubric create(@RequestBody Rubric rubric) {
        return rubricService.create(rubric);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        rubricService.delete(id);
    }

}