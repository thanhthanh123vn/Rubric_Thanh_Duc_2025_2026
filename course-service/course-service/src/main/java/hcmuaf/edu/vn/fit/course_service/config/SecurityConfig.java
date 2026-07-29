package hcmuaf.edu.vn.fit.course_service.config;

import hcmuaf.edu.vn.fit.course_service.util.JwtFilter;
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

                        // WebSockets
                        .requestMatchers("/api/v1/course-service/ws/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()

                        // Quyền ADMIN

                        .requestMatchers(
                                "/api/v1/course-service/admin/dashboard/**",
                                "/api/v1/course-service/admin/reports/**",
                                "/api/v1/course-service/system-logs/**"
                        ).hasRole("ADMIN")


                        .requestMatchers("/api/v1/course-service/assessments/**")
                        .permitAll()
                        // Quyền GIẢNG VIÊN (Teacher / Main Lecturer)
                        .requestMatchers(


                                "/api/v1/course-service/question-banks/**",
                                "/api/v1/course-service/questions/**",
                                "/api/v1/course-service/obe/**",
                                "/api/v1/course-service/syllabus/**"
                        ).hasAnyRole("ADMIN", "TEACHER", "MAIN_LECTURER")



                        // Quyền SINH VIÊN (Student)

                        .requestMatchers(
                                "/api/v1/course-service/student/attendance/**",
                                "/api/v1/course-service/student/exams/**"

                        ).hasRole("STUDENT")

                        // Quyền TRUY CẬP CHUNG (Đã đăng nhập)

                        .requestMatchers(
                                "/api/v1/course-service/courses/**",
                                "/api/v1/course-service/course-offerings/**",
                                "/api/v1/course-service/course-schedules/**",
                                "/api/v1/course-service/enrollments/**",
                                "/api/v1/course-service/groups/**",
                                "/api/v1/course-service/group-tasks/**",
                                "/api/v1/course-service/posts/**",
                                "/api/v1/course-service/topics/**",
                                "/api/v1/course-service/chat/**"
                        ).authenticated()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}