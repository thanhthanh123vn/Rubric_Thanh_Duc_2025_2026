package hcmuaf.edu.vn.fit.grading_service.controller;

import hcmuaf.edu.vn.fit.grading_service.entity.Grade;
import hcmuaf.edu.vn.fit.grading_service.service.GradingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/grades")
public class GradingController {

    @Autowired
    private GradingService service;

    @PostMapping("/grade")
    public Grade gradeStudent(
            @RequestParam Long studentId,
            @RequestParam Long rubricId) {

        return service.gradeStudent(studentId, rubricId);
    }
}