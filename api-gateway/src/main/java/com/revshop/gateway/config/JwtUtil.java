package com.revshop.gateway.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenExpired(String token) {
        try {
            return extractAllClaims(token).getExpiration().before(new java.util.Date());
        } catch (Exception e) {
            return true;
        }
    }

    public boolean validateToken(String token) {
        try {
            extractAllClaims(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    public String extractUsername(String token) {
        try {
            return extractAllClaims(token).getSubject();
        } catch (Exception e) {
            return "";
        }
    }

    public String extractRole(String token) {
        try {
            Object role = extractAllClaims(token).get("role");
            return role != null ? role.toString() : "";
        } catch (Exception e) {
            return "";
        }
    }

    public String extractUserId(String token) {
        try {
            Claims claims = extractAllClaims(token);
            // Try different claim names and types
            Object userId = claims.get("userId");
            if (userId == null) userId = claims.get("user_id");
            if (userId == null) userId = claims.get("id");
            if (userId != null) {
                // Handle Integer, Long, String
                if (userId instanceof Integer) return String.valueOf((Integer) userId);
                if (userId instanceof Long) return String.valueOf((Long) userId);
                return userId.toString();
            }
            return "0";
        } catch (Exception e) {
            return "0";
        }
    }
}
