package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.ProgramPloRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.ProgramPloResponse;
import hcmuaf.edu.vn.fit.course_service.service.ProgramPloService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/course-service/plos")
public class ProgramPloController {
    private final ProgramPloService service;

    @GetMapping
    public ResponseEntity<List<ProgramPloResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PostMapping
    public ResponseEntity<ProgramPloResponse> create(@RequestBody ProgramPloRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PutMapping("/{ploId}")
    public ResponseEntity<ProgramPloResponse> update(@PathVariable String ploId, @RequestBody ProgramPloRequest request) {
        return ResponseEntity.ok(service.update(ploId, request));
    }

    @DeleteMapping("/{ploId}")
    public ResponseEntity<Void> delete(@PathVariable String ploId) {
        service.delete(ploId);
        return ResponseEntity.noContent().build();
    }
}
