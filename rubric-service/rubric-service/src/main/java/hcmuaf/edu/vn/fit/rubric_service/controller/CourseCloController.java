package hcmuaf.edu.vn.fit.rubric_service.controller;

import hcmuaf.edu.vn.fit.rubric_service.client.ClientIpUtil;
import hcmuaf.edu.vn.fit.rubric_service.client.CourseClient;
import hcmuaf.edu.vn.fit.rubric_service.dto.request.CloRequest;
import hcmuaf.edu.vn.fit.rubric_service.dto.request.SystemLogRequest;
import hcmuaf.edu.vn.fit.rubric_service.entity.CourseCloEntity;
import hcmuaf.edu.vn.fit.rubric_service.service.CourseCloService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rubric-service/course-clo")
@RequiredArgsConstructor
public class CourseCloController {


    private final CourseCloService courseCloService;
    private final CourseClient courseClient;

    @GetMapping
    public List<CourseCloEntity> getAll(){
        return courseCloService.getAll();
    }

    @PostMapping
    public ResponseEntity<?> createCourseClo(
            @RequestHeader("X-User-UserName") String userName ,
            @RequestBody CloRequest courseCloEntity,
            HttpServletRequest httpServletRequest){
        if(userName== null || courseCloEntity == null)
            return ResponseEntity.badRequest().body("Username or Course Clo is null");
        try{
            String ip = ClientIpUtil.getClientIp(httpServletRequest);
            courseClient.writeLog(SystemLogRequest.builder()
                            .level("INFO")
                            .action("CREATE COURSE CLO")
                            .message("Tạo Chuẩn đầu ra học phần")
                            .username(userName)
                            .ip(ip)
                    .build());

        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        return ResponseEntity.ok(courseCloService.createClo(courseCloEntity));
    }

    @PutMapping("/{cloId}")
    public ResponseEntity<?> updateCourseClo(@PathVariable String cloId, @RequestBody CloRequest courseCloEntity){
        return ResponseEntity.ok(courseCloService.updateClo(cloId, courseCloEntity));
    }
}
