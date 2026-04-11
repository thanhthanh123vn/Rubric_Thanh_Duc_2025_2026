package hcmuaf.edu.vn.fit.course_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients(basePackages = "hcmuaf.edu.vn.fit.course_service.client")
public class CourseServiceApplication {
	public static void main(String[] args) {

		SpringApplication.run(CourseServiceApplication.class, args);
	}

}
