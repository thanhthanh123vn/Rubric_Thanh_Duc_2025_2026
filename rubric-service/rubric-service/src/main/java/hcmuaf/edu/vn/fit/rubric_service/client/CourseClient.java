package hcmuaf.edu.vn.fit.rubric_service.client;

import hcmuaf.edu.vn.fit.rubric_service.dto.response.CourseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;



@FeignClient(name = "course-service",    url = "http://localhost:8082",
        path = "/api/v1/course-service/courses")
public interface CourseClient {

    @GetMapping("/department/{department}")
    List<CourseDto> getCoursesByDepartment(@PathVariable("department") String department);

//    CourseDto getCourseById(String courseId);
}