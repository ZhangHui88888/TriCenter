package com.tricenter.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * System-to-system API Key authentication filter.
 * Allows Booking-miniapp to call TriCenter APIs using a shared secret key.
 */
@Slf4j
@Component
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    private static final String API_KEY_HEADER = "X-API-Key";

    @Value("${tricenter.api-key:booking-to-tricenter-secret-key}")
    private String validApiKey;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String apiKey = request.getHeader(API_KEY_HEADER);
            if (StringUtils.hasText(apiKey) && apiKey.equals(validApiKey)) {
                LoginUser systemUser = new LoginUser(0, "booking-system", "SYSTEM");
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_SYSTEM");
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(systemUser, null, Collections.singletonList(authority));
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("Authenticated system request via API Key");
            }
        }

        filterChain.doFilter(request, response);
    }
}
