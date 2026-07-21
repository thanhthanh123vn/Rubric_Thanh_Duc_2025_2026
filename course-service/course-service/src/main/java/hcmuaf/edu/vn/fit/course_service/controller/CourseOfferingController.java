package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.client.ClientIpUtil;
import hcmuaf.edu.vn.fit.course_service.dto.request.CourseOfferingRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.CourseOfferingResponse;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.service.CourseOfferingService;
import hcmuaf.edu.vn.fit.course_service.service.CourseService;
import hcmuaf.edu.vn.fit.course_service.service.SystemLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/course-service/courses-offering")
public class CourseOfferingController {
   private final CourseOfferingService courseOfferingService;
   private final SystemLogService systemLogService;
    @PostMapping("/{courseId}/offerings")
    public ResponseEntity<CourseOfferingResponse> createCourseOffering(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String courseId,
            @RequestBody CourseOfferingRequest request,
            HttpServletRequest httpServletRequest) {
        if(userId == null || courseId == null || request == null)
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        try{
            String ip = ClientIpUtil.getClientIp(httpServletRequest);
            String userName = httpServletRequest.getHeader("X-User-Username");
            systemLogService.writeLog(
                    "INFO",
                    "Create CourseOffering",
                    "Tạo Học Phần thành công ",
                    userName,
                    ip
            );


        } catch (Exception e) {
            String ip = ClientIpUtil.getClientIp(httpServletRequest);
            String userName = httpServletRequest.getHeader("X-User-Username");
            systemLogService.writeLog(
                    "ERROR",
                    "Create CourseOffering",
                    "Lỗi khi Tạo Học Phần thành công: " + e.getMessage(),
                    userName,
                    ip
            );
        }

        return new ResponseEntity<>(courseOfferingService.createOffering(courseId, request), HttpStatus.CREATED);
    }

    @GetMapping("/{courseId}/offerings")
    public ResponseEntity<CourseOfferingResponse> getOfferingsByCourse(@PathVariable String courseId) {
        return ResponseEntity.ok(courseOfferingService.getOfferingById(courseId));
    }
    @GetMapping("/offerings")
    public ResponseEntity<List<CourseOfferingResponse>> getOfferings() {
        return ResponseEntity.ok(courseOfferingService.getOfferings());
    }

}
