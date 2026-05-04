package hcmuaf.edu.vn.fit.notification_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableConfigurationProperties
@EnableDiscoveryClient

@EnableJpaAuditing
@EnableFeignClients(basePackages = "hcmuaf.edu.vn.fit.notification_service.client")
@SpringBootApplication
public class NotificationServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(NotificationServiceApplication.class, args);
	}

}
