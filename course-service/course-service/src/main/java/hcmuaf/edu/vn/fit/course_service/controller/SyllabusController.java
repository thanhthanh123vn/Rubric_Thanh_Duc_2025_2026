package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.response.SyllabusFileDTO;
import hcmuaf.edu.vn.fit.course_service.service.S3Service;
import hcmuaf.edu.vn.fit.course_service.service.SyllabusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/course-service/syllabus")
@RequiredArgsConstructor
public class SyllabusController {

    private final SyllabusService syllabusService;
    private final S3Service s3Service;

    @PostMapping("/{courseId}")
    public ResponseEntity<SyllabusFileDTO> uploadSyllabus(
            @PathVariable String courseId,
            @RequestParam("file") MultipartFile file) throws IOException {


        String fileUrl = s3Service.uploadFile(file);


        SyllabusFileDTO result = syllabusService.saveSyllabusInfo(courseId, fileUrl, file.getOriginalFilename());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<List<SyllabusFileDTO>> getSyllabusByCourse(@PathVariable String courseId) {
        return ResponseEntity.ok(syllabusService.getByCourseId(courseId));
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteSyllabus(@PathVariable String fileId) {
        syllabusService.deleteSyllabus(fileId);
        return ResponseEntity.noContent().build();
    }
}