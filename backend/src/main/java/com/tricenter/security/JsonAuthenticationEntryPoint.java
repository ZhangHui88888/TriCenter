package com.tricenter.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tricenter.common.result.ErrorKeys;
import com.tricenter.common.result.Result;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * 未登录（access cookie 已过期或缺失）返回 401，前端据此用 refresh cookie 续期；
 * Spring 默认的 403 会被前端当成“没有权限”，既不续期也不跳登录页。
 */
@Component
@RequiredArgsConstructor
public class JsonAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(),
                Result.unauthorized(ErrorKeys.TOKEN_EXPIRED, "登录已过期，请重新登录"));
    }
}
