package hcmuaf.edu.vn.fit.grading_service;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@FeignClient(name = "user-service")
public interface RubricClient {

    @GetMapping("/api/v1/rubrics/{id}")
    Map<String, Object> getRubric(@PathVariable Long id);
}