package hcmuaf.edu.vn.fit.rubric_service.controller;

import hcmuaf.edu.vn.fit.rubric_service.dto.request.CloRequest;
import hcmuaf.edu.vn.fit.rubric_service.entity.CourseCloEntity;
import hcmuaf.edu.vn.fit.rubric_service.service.CourseCloService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rubric-service/course-clo")
public class CourseCloController {

    @Autowired
    private CourseCloService courseCloService;;

    @GetMapping
    public List<CourseCloEntity> getAll(){
        return courseCloService.getAll();
    }

    @PostMapping
    public ResponseEntity<?> createCourseClo(@RequestBody CloRequest courseCloEntity){
        return ResponseEntity.ok(courseCloService.createClo(courseCloEntity));
    }
}
