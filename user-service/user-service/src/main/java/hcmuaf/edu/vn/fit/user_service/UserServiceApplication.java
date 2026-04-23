package hcmuaf.edu.vn.fit.user_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

//import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;
//
//@EnableEurekaServer
@SpringBootApplication
@EnableConfigurationProperties
@EnableDiscoveryClient
@EnableJpaAuditing

public class UserServiceApplication {

    public static void main(String[] args) {

        SpringApplication.run(UserServiceApplication.class, args);
    }

}
