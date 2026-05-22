package hcmuaf.edu.vn.fit.rubric_service.controller;


import hcmuaf.edu.vn.fit.rubric_service.dto.request.RubricMatrixRequest;
import hcmuaf.edu.vn.fit.rubric_service.service.RubricMatrixService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rubric-service/rubric-matrices")
public class RubricMatrixController {

    @Autowired
    private RubricMatrixService rubricMatrixService;

    @PostMapping
    public boolean rubricMatrix(@RequestBody RubricMatrixRequest req) {
        return rubricMatrixService.updateMatrix(req);
    }
}
