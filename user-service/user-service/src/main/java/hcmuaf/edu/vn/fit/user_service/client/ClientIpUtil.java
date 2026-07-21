package hcmuaf.edu.vn.fit.user_service.client;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class ClientIpUtil {

    private ClientIpUtil() {
    }
    public static String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            return auth.getName();
        }
        return "SYSTEM";
    }
    public static String getClientIp(HttpServletRequest request) {
        String[] headers = {
                "X-Forwarded-For",
                "X-Real-IP",
                "Forwarded",
                "Proxy-Client-IP",
                "WL-Proxy-Client-IP",
                "HTTP_X_FORWARDED_FOR",
                "HTTP_X_FORWARDED",
                "HTTP_X_CLUSTER_CLIENT_IP",
                "HTTP_CLIENT_IP",
                "HTTP_FORWARDED_FOR",
                "HTTP_FORWARDED",
                "HTTP_VIA"
        };

        for (String header : headers) {
            String ip = request.getHeader(header);

            if (ip != null
                    && !ip.isBlank()
                    && !"unknown".equalsIgnoreCase(ip)) {


                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }

                return ip;
            }
        }

        return request.getRemoteAddr();
    }
}