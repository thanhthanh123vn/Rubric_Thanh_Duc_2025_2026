package hcmuaf.edu.vn.fit.rubric_service.controller;

import hcmuaf.edu.vn.fit.rubric_service.service.RubricService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

public class RubricServiceController {

    @RestController
    @RequestMapping("/api/v1/rubrics")
    public class RubricController {

        @Autowired
        private RubricService service;

        @GetMapping
        public List<Rubric> getAll() {
            return service.getAll();
        }

        @GetMapping("/{id}")
        public Rubric getById(@PathVariable Long id) {
            return service.getById(id);
        }

        @PostMapping
        public Rubric create(@RequestBody Rubric rubric) {
            return service.create(rubric);
        }

        @DeleteMapping("/{id}")
        public void delete(@PathVariable Long id) {
            service.delete(id);
        }
    }
}