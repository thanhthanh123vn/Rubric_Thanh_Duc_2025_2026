package hcmuaf.edu.vn.fit.user_service.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {
    @Value("${app.jwt.secret}")
    private String SECRET_KEY;

    @Value("${app.jwt.access-token-expiration}")
    private long ACCESS_TOKEN_EXPIRATION;

    @Value("${app.jwt.refresh-token-expiration}")
    private long REFRESH_TOKEN_EXPIRATION;
    public Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }


    public String generateToken(String userId, String role,String userName) {
        return Jwts.builder()
                .setSubject(userName)
                .claim("userId", userId)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION))
                .signWith(getSigningKey())
                .
                compact();
    }

    public String generateRefreshToken(String userId, String userName, String role) {
        return buildToken(userId, userName, role, REFRESH_TOKEN_EXPIRATION);
    }
    private String buildToken(String userId,String userName, String role, long expiration) {
        return Jwts.builder()
                .setSubject(userName)
                .claim("userId", userId)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }
    public long getExpirationTime(String token) {
        try {
            return extractAllClaims(token).getExpiration().getTime();
        } catch (Exception e) {
            return 0;
        }
    }
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }
    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }
    public boolean isTokenValid(String token) {
        try{
            Claims claims = extractAllClaims(token);

            return claims.getExpiration().after(new Date());
        }catch (Exception e){

        }
        return false;
    }
    public String extractUserId(String token) {
        return extractAllClaims(token).get("userId", String.class);
    }
    public boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}