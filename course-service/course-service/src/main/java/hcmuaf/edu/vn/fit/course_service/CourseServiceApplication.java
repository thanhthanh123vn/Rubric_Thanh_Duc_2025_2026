package hcmuaf.edu.vn.fit.course_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
@EnableFeignClients(basePackages = "hcmuaf.edu.vn.fit.course_service.client")
@EnableDiscoveryClient
@EnableConfigurationProperties
public class CourseServiceApplication {
	public static void main(String[] args) {

		SpringApplication.run(CourseServiceApplication.class, args);
	}

}
