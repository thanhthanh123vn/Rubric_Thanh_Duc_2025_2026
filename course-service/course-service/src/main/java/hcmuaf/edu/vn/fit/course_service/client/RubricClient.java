package hcmuaf.edu.vn.fit.course_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(
        name = "rubric-service",
        url = "${clients.rubric-service.url:http://localhost:8083/api/v1/rubric-service}",
        configuration = FeignConfig.class
)
public interface RubricClient {

    @GetMapping("/rubrics/count")
    long getRubricCount();
}