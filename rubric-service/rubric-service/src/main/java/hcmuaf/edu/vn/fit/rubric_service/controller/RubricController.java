package hcmuaf.edu.vn.fit.rubric_service.controller;

import hcmuaf.edu.vn.fit.rubric_service.dto.response.RubricResponse;
import hcmuaf.edu.vn.fit.rubric_service.entity.Rubric;
import hcmuaf.edu.vn.fit.rubric_service.service.RubricService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rubric-service/rubrics")
public class RubricController {

    @Autowired
    private RubricService service;

    @GetMapping
    public List<RubricResponse> getAll() {
        return service.getAllRubrics();
    }

    @GetMapping("/{id}")
    public Rubric getById(@PathVariable String id) {
        return service.getById(id);
    }

    @PostMapping
    public Rubric create(@RequestBody Rubric rubric) {
        return service.create(rubric);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}