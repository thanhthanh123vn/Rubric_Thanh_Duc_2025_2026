package hcmuaf.edu.vn.fit.grading_service;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@FeignClient(
        name = "rubric-service",
        url = "${clients.rubric-service.url:http://localhost:8083/api/v1/rubric-service}"
)
public interface RubricClient {

    @GetMapping("/rubrics/{id}")
    Map<String, Object> getRubric(@PathVariable("id") String id);
}
