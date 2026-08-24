package hcmuaf.edu.vn.fit.rubric_service.client;

import hcmuaf.edu.vn.fit.rubric_service.dto.response.FacultyResponse;
import hcmuaf.edu.vn.fit.rubric_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.rubric_service.dto.response.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(
        name = "user-service",
        url = "${clients.user-service.url:http://localhost:8081/api/v1/user-service}",
        configuration = FeignConfig.class
)
public interface UserClient {

    @GetMapping("/users/{id}")
    UserResponse getUser(@PathVariable("id") String id);

    @GetMapping("/users/batch")
    Map<String, UserResponse> getUsers(@RequestParam("ids") List<String> ids);


    @GetMapping("/lecturer/lecturers/{lecturerId}")
    LecturerResponse getLecturer(@PathVariable("lecturerId") String lecturerId);

    @GetMapping("/lecturer/lecturers/by-user/{userId}")
    LecturerResponse getLecturerByUserId(@PathVariable("userId") String userId);

    @GetMapping("/faculties/department/{departmentName}")
    FacultyResponse getFacultyByDepartmentName(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable("departmentName") String departmentName
    );

    @GetMapping("/faculties/{facultyName}/departments")
    List<String> getDepartmentNamesByFaculty(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable("facultyName") String facultyName
    );


}

