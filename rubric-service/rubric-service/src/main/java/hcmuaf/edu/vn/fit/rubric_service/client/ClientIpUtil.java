package hcmuaf.edu.vn.fit.rubric_service.client;
import jakarta.servlet.http.HttpServletRequest;

public final class ClientIpUtil {

    private ClientIpUtil() {
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