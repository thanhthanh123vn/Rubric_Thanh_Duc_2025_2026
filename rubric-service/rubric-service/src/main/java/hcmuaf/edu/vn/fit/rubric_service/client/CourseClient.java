package hcmuaf.edu.vn.fit.rubric_service.client;

import hcmuaf.edu.vn.fit.rubric_service.dto.request.SystemLogRequest;
import hcmuaf.edu.vn.fit.rubric_service.dto.response.CourseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;



@FeignClient(name = "course-service", url = "${clients.course-service.url:http://localhost:8082}",
        path = "/api/v1/course-service/courses")
public interface CourseClient {

    @GetMapping("/department/{department}")
    List<CourseDto> getCoursesByDepartment(@PathVariable("department") String department);
    @PostMapping("/system-logs")
    void writeLog(@RequestBody SystemLogRequest request);
//    CourseDto getCourseById(String courseId);
}
