package hcmuaf.edu.vn.fit.grading_service.client;

import hcmuaf.edu.vn.fit.grading_service.dto.response.StudentCourseResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "course-service",    url = "http://localhost:8082",
        path = "/api/v1/course-service/courses")
public interface CourseClient {
    @GetMapping("/offering/{offeringId}/students")

    List<StudentCourseResponse> getStudentsByOffering(@PathVariable("offeringId") String offeringId);



}
