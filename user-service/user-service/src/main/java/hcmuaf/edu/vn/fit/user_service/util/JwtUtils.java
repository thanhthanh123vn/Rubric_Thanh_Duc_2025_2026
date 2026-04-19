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
    @Value("${SECRET_KEY}")
    private  String SECRET_KEY ;
    private final long EXPIRATION_TIME = 86400000;
    private final long ACCESS_TOKEN_EXPIRATION = 86400000; // 1 ngày
    private final long REFRESH_TOKEN_EXPIRATION = 604800000;
    public Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }


    public String generateToken(String userId, String role) {
        return Jwts.builder()
                .setSubject(userId)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey())
                .
                compact();
    }

    public String generateRefreshToken(String userId, String role) {
        return buildToken(userId, role, REFRESH_TOKEN_EXPIRATION);
    }
    private String buildToken(String userId, String role, long expiration) {
        return Jwts.builder()
                .setSubject(userId)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
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