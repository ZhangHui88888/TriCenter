package com.tricenter.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tricenter.common.result.Result;
import com.tricenter.entity.City;
import com.tricenter.service.CityAccessService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.regex.Pattern;

/**
 * System-to-system API Key authentication filter.
 * Allows Booking-miniapp to call TriCenter APIs using a shared secret key.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    private static final String API_KEY_HEADER = "X-API-Key";
    private static final Pattern ENTERPRISE_BY_ID_PATH =
            Pattern.compile("/api/enterprises/\\d+");

    @Value("${tricenter.api-key:booking-to-tricenter-secret-key}")
    private String validApiKey;

    @Value("${tricenter.booking-city-code:changzhou}")
    private String bookingCityCode;

    private final CityAccessService cityAccessService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String apiKey = request.getHeader(API_KEY_HEADER);
            if (StringUtils.hasText(apiKey) && apiKey.equals(validApiKey)) {
                if (!isBookingEndpoint(request)) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    objectMapper.writeValue(
                            response.getWriter(), Result.forbidden("API Key 无权访问该接口"));
                    return;
                }
                City city = cityAccessService.requireCityByCode(bookingCityCode);
                LoginUser systemUser = new LoginUser(
                        0, "booking-system", "SYSTEM", city.getId(), true);
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_SYSTEM");
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(systemUser, null, Collections.singletonList(authority));
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("Authenticated system request via API Key");
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isBookingEndpoint(HttpServletRequest request) {
        String path = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (StringUtils.hasText(contextPath) && path.startsWith(contextPath)) {
            path = path.substring(contextPath.length());
        }
        String method = request.getMethod();
        return ("POST".equals(method) && "/api/enterprises".equals(path))
                || ("PUT".equals(method) && ENTERPRISE_BY_ID_PATH.matcher(path).matches())
                || ("GET".equals(method) && path.startsWith("/api/options/"));
    }
}
