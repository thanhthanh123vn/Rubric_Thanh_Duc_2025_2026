package hcmuaf.edu.vn.fit.course_service.client;

import hcmuaf.edu.vn.fit.course_service.dto.response.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(
        name = "user-service",
        url = "http://localhost:8081"
)
public interface UserClient {

    @GetMapping("/api/users/{id}")
    UserResponse getUser(@PathVariable("id") String id);

    @GetMapping("/api/users/batch")
    Map<String, UserResponse> getUsers(@RequestParam("ids") List<String> ids);
}
