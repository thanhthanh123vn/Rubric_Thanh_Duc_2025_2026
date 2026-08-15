package hcmuaf.edu.vn.fit.api_gateway.filter;

import hcmuaf.edu.vn.fit.api_gateway.util.JwtUtils;
import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    @Autowired
    private JwtUtils jwtUtils;

    // THÊM REDIS TEMPLATE ĐỂ KIỂM TRA SESSION VÀ BLACKLIST
    @Autowired
    private StringRedisTemplate redisTemplate;

    public JwtAuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {

            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();
            log.info("Request: {}", request.getURI());
            if (request.getMethod().matches("OPTIONS")) {
                return chain.filter(exchange);
            }
            if (path.contains("/auth/login") ||
                    path.contains("/auth/register") ||

                    path.contains("/oauth2-success")||
            path.contains("/ws")||
           path.contains("/ws-notifications")) {

                return chain.filter(exchange);
            }
            String token = null;
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);


            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }

            else {
                token = request.getQueryParams().getFirst("token");
            }


            if (token == null || token.isBlank()) {
                log.warn("Missing Authorization Token for URI: {}", request.getURI());
                return onError(exchange, "Missing Authorization Token", HttpStatus.UNAUTHORIZED);
            }

            log.info("Token extracted successfully for URI: {}", request.getURI());

            try {
                // KIỂM TRA REDIS: TOKEN CÓ BỊ ĐƯA VÀO BLACKLIST KHÔNG?
                String blacklistKey = "blacklist:token:" + token;
                Boolean isBlacklisted = redisTemplate.hasKey(blacklistKey);
                if (Boolean.TRUE.equals(isBlacklisted)) {
                    log.warn("Token is blacklisted (User already logged out)");
                    return onError(exchange, "Token đã bị vô hiệu hóa (Đăng xuất). Vui lòng đăng nhập lại.", HttpStatus.UNAUTHORIZED);
                }

                // parse token
                Claims claims = jwtUtils.validateAndExtractClaims(token);
                String userId = claims.get("userId", String.class);
                String roles = claims.get("role", String.class);
                String userName = claims.getSubject();

                // KIỂM TRA REDIS: SESSION CỦA USER NÀY CÒN TỒN TẠI KHÔNG?

                String sessionKey = "session:user:" + userId;
                Boolean hasSession = redisTemplate.hasKey(sessionKey);
                if (Boolean.FALSE.equals(hasSession)) {
                    log.warn("User session expired or cleared in Redis for UserId: {}", userId);
                    return onError(exchange, "Phiên đăng nhập đã hết hạn hoặc bạn đã đăng nhập ở nơi khác.", HttpStatus.UNAUTHORIZED);
                }

                String ip = request.getHeaders().getFirst("X-Forwarded-For");

                if (ip == null || ip.isBlank()) {
                    if (request.getRemoteAddress() != null) {
                        ip = request.getRemoteAddress().getAddress().getHostAddress();
                    } else {
                        ip = "unknown";
                    }
                }

                log.info("Subject = {}", userName);
                log.info("UserId = {}", userId);
                log.info("Role = {}", roles);

                ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                        .header("X-User-Id", userId)
                        .header("X-User-Role", roles != null ? roles : "")
                        .header("X-User-Username",userName)
                        .header("X-User-IP", ip)
                        .build();

                return chain.filter(exchange.mutate().request(modifiedRequest).build());

            } catch (Exception e) {
                // Bỏ qua dòng lấy lại claims nếu token đã lỗi, nó sẽ lại văng exception
//                 Claims claims = jwtUtils.validateAndExtractClaims(token);

                log.error("Authentication Failed: {}", e.getMessage());
                return onError(exchange, "Token không hợp lệ hoặc đã hết hạn: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
            }
        };
    }


    private Mono<Void> onError(org.springframework.web.server.ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String responseBody = String.format("{\"error\": \"Unauthorized\", \"message\": \"%s\"}", err);
        DataBuffer buffer = response.bufferFactory().wrap(responseBody.getBytes(StandardCharsets.UTF_8));

        return response.writeWith(Mono.just(buffer));
    }

    public static class Config {
    }
}