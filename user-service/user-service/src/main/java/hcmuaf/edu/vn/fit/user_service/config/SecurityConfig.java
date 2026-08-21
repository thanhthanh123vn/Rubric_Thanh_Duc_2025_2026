package hcmuaf.edu.vn.fit.user_service.config;

import hcmuaf.edu.vn.fit.user_service.util.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())

                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())

                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers(
                                "/api/v1/user-service/auth/login",
                                "/api/v1/user-service/auth/logout",
                                "/api/v1/user-service/auth/refresh",
                                "/api/v1/user-service/auth/forgot-password"
                        ).permitAll()
                                .requestMatchers("/ws/**").permitAll()
                                .requestMatchers("/ws-notifications/**").permitAll()
                        .requestMatchers("/api/v1/user-service/users/admin/**").hasRole("ADMIN")
                                .requestMatchers("/api/v1/user-service/settings/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.GET,
                                        "/api/v1/user-service/lecturer/**")
                                .authenticated()
                                .requestMatchers(HttpMethod.PUT,
                                        "/api/v1/user-service/lecturer/profile/me")
                                .authenticated()

//
//
//                        .requestMatchers("/api/v1/user-service/lecturer/**").hasAnyRole("ADMIN","TEACHER","DEAN","HEAD_OF_DEPARTMENT","MAIN_LECTURER")
                        .requestMatchers("/api/v1/user-service/users/me").authenticated()

                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}