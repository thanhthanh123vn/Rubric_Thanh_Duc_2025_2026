package hcmuaf.edu.vn.fit.rubric_service.controller;

import hcmuaf.edu.vn.fit.rubric_service.entity.Rubric;
import hcmuaf.edu.vn.fit.rubric_service.service.RubricService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

public class RubricServiceController {

    @RestController
    @RequestMapping("/api/v1/rubrics-service/rubric")
    public class RubricController {

        @Autowired
        private RubricService rubricService;

        @GetMapping("/{id}")
        public ResponseEntity<Rubric> getRubricById(@PathVariable String id) {
            return ResponseEntity.ok(rubricService.getRubricById(id));
        }
    }
}