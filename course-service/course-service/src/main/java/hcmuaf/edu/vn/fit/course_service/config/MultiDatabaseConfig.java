package hcmuaf.edu.vn.fit.course_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration

@EnableJpaRepositories(basePackages = "hcmuaf.edu.vn.fit.course_service.repository.jpa")

@EnableMongoRepositories(basePackages = "hcmuaf.edu.vn.fit.course_service.repository.mongo")
public class MultiDatabaseConfig {
}