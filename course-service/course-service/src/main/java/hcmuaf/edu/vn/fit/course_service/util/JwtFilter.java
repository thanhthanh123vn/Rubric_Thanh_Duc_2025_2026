package hcmuaf.edu.vn.fit.course_service.util;



import hcmuaf.edu.vn.fit.course_service.config.UserPrincipal;
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
        String token = null;
        if (path.startsWith("/ws") || path.startsWith("/api/v1/course-service/ws")) {
            filterChain.doFilter(request, response);
            return;
        }
        String header = request.getHeader("Authorization");
        if(header != null && header.startsWith("Bearer ")){
            token = header.substring(7);
        }

        else if (request.getParameter("token") != null) {
            token = request.getParameter("token");
        }

        // 3. Nếu tìm thấy token (từ Header hoặc URL), tiến hành giải mã
        if(token != null) {
            if(jwtUtils.isTokenValid(token)){
                String username = jwtUtils.extractUsername(token);
                String role = jwtUtils.extractRole(token);
                String userId = jwtUtils.extractUserId(token);

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

//                // Giữ nguyên dòng log để bạn dễ debug
//                System.out.println("Authorities = " + authentication.getAuthorities());
//                System.out.println("Principal = " + authentication.getPrincipal());
            }
        }

        filterChain.doFilter(request,response);
    }

}
