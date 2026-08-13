package hcmuaf.edu.vn.fit.grading_service.config;

import hcmuaf.edu.vn.fit.grading_service.util.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Chỉ giảng viên mới được phép thực hiện chấm bài và cấu hình điểm
                        .requestMatchers(HttpMethod.POST, "/api/v1/grading-service/**").hasAnyRole("TEACHER", "MAIN_LECTURER")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/grading-service/**").hasAnyRole("TEACHER", "MAIN_LECTURER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/grading-service/**").hasAnyRole("TEACHER", "MAIN_LECTURER","HEAD_OF_DEPARTMENT","DEAN","ADMIN")
                        .requestMatchers("/api/v1/grading-service/gradebooks/config/**").hasAnyRole("TEACHER", "MAIN_LECTURER","HEAD_OF_DEPARTMENT","DEAN","ADMIN")

                        // Sinh viên chỉ được phép XEM (GET) điểm của chính mình
                        .requestMatchers(HttpMethod.GET, "/api/v1/grading-service/grade/assessment/**").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.GET, "/api/v1/grading-service/exams/**").hasRole("STUDENT")


                        .requestMatchers(
                                "/api/v1/grading-service/grading/**",
                                "/api/v1/grading-service/gradebooks/**"
                        ).authenticated()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}