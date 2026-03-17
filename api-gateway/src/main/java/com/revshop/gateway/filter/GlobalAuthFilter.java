package com.revshop.gateway.filter;

import com.revshop.gateway.config.JwtUtil;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import java.util.List;

@Component
public class GlobalAuthFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;

    private static final List<String> OPEN_ENDPOINTS = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/categories"
    );

    public GlobalAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Always extract user info from token if present
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                if (jwtUtil.validateToken(token)) {
                    String username = jwtUtil.extractUsername(token);
                    String role = jwtUtil.extractRole(token);
                    String userId = jwtUtil.extractUserId(token);

                    ServerHttpRequest modifiedRequest = request.mutate()
                            .header("X-User-Name", username != null ? username : "")
                            .header("X-User-Role", role != null ? role : "")
                            .header("X-User-Id", userId != null ? userId : "0")
                            .build();

                    return chain.filter(exchange.mutate().request(modifiedRequest).build());
                }
            } catch (Exception e) {
                // Token invalid - continue without headers
            }
        }

        // Block protected endpoints without token
        if (!isOpenEndpoint(path) && !isPublicGet(request)) {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                ServerHttpResponse response = exchange.getResponse();
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return response.setComplete();
            }
        }

        return chain.filter(exchange);
    }

    private boolean isOpenEndpoint(String path) {
        return OPEN_ENDPOINTS.stream().anyMatch(path::startsWith);
    }

    private boolean isPublicGet(ServerHttpRequest request) {
        String method = request.getMethod().name();
        String path = request.getURI().getPath();
        return method.equals("GET") && (
                path.startsWith("/api/products") ||
                path.startsWith("/api/categories")
        );
    }

    @Override
    public int getOrder() {
        return -1; // Run before all other filters
    }
}
