package hcmuaf.edu.vn.fit.rubric_service.config;

import hcmuaf.edu.vn.fit.rubric_service.util.JwtFilter;
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


                        // Quyền QUẢN TRỊ & GIẢNG VIÊN
                        // (Tạo mới, chỉnh sửa, xóa Rubric và các Criteria/Tiêu chí)

                        .requestMatchers(HttpMethod.POST, "/api/v1/rubric-service/**").hasAnyRole("ADMIN", "LECTURER", "MAIN_LECTURER")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/rubric-service/**").hasAnyRole("ADMIN", "LECTURER", "MAIN_LECTURER")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/rubric-service/**").hasAnyRole("ADMIN", "LECTURER", "MAIN_LECTURER")

                        // Quyền CHUNG (Đã xác thực)
                        // Sinh viên cần được phép GET Rubric để xem chi tiết các tiêu chí chấm điểm của bài tập/môn học

                        .requestMatchers(HttpMethod.GET, "/api/v1/rubric-service/**").authenticated()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}