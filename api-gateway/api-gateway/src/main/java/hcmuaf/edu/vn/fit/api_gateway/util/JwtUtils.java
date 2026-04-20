package hcmuaf.edu.vn.fit.api_gateway.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;

import static javax.crypto.Cipher.SECRET_KEY;

@Slf4j
@Component
public class JwtUtils {
    @Value("${SECRET_KEY}")
    private String SECRET_KEY;

    private Key getSignKey() {
           return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());


    }


    public Claims validateAndExtractClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSignKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
            throw new RuntimeException("Token expired");
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
            throw new RuntimeException("Unsupported token");
        } catch (MalformedJwtException | SignatureException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            throw new RuntimeException("Invalid token");
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
            throw new RuntimeException("Empty claims");
        }
    }
}