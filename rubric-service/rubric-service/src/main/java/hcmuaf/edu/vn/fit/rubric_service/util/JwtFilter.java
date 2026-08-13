package hcmuaf.edu.vn.fit.rubric_service.util;




import hcmuaf.edu.vn.fit.rubric_service.config.UserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        System.out.println("=== JWT FILTER DEBUG ===");
        System.out.println("1. Request URI: " + path);

        String header = request.getHeader("Authorization");
        System.out.println("2. Authorization Header: " + header);

        if(header != null && header.startsWith("Bearer ")){
            String token = header.substring(7);
            System.out.println("3. Token extracted: " + token.substring(0, 10) + "..."); // Chỉ in 10 ký tự đầu cho đỡ dài

            boolean isValid = jwtUtils.isTokenValid(token);
            System.out.println("4. Is Token Valid?: " + isValid);

            if(isValid){
                String username = jwtUtils.extractUsername(token);
                String role = jwtUtils.extractRole(token);
                String userId = jwtUtils.extractUserId(token);

                System.out.println("5. Extracted Role: " + role);

                UserPrincipal principal = new UserPrincipal(userId, username, role);
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                principal,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role))
                        );
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println("6. Authentication set successfully!");
            } else {
                System.out.println("❌ LỖI: Token không hợp lệ hoặc sai Secret Key!");
            }
        } else {
            System.out.println("❌ LỖI: Không tìm thấy Header Authorization hoặc không có chữ 'Bearer '");
        }

        System.out.println("========================");
        filterChain.doFilter(request,response);
    }
}
