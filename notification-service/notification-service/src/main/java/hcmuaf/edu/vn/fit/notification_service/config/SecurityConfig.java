package hcmuaf.edu.vn.fit.notification_service.config;

import hcmuaf.edu.vn.fit.notification_service.util.JwtFilter;
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

                        // Cho phép Client kết nối WebSockets để nhận thông báo realtime
                        .requestMatchers("/api/v1/notification-service/ws-notifications/**").permitAll()

                        // Chỉ Admin hoặc System mới được tạo thông báo hệ thống (Global Broadcast)
                        .requestMatchers(HttpMethod.POST, "/api/v1/notification-service/notifications/broadcast").hasRole("ADMIN")

                        // Các API lấy thông báo của cá nhân yêu cầu Authenticated
                        .requestMatchers("/api/v1/notification-service/getNotification/**").authenticated()
                        .requestMatchers("/api/v1/notification-service/notifications/**").authenticated()
                        .requestMatchers("/api/v1/notification-service/").authenticated()

                        // Gửi Bài Tập Về Nhà
                        .requestMatchers(HttpMethod.POST,
                                "/api/v1/notification-service/homework-assigned-multiple")
                        .hasAnyRole("STUDENT", "TEACHER", "DEAN", "MAIN_TEACHER","MAIN_TEACHER")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}