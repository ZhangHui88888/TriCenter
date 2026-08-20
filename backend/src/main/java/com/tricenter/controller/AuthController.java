package com.tricenter.controller;

import com.tricenter.common.result.Result;
import com.tricenter.dto.request.ChangePasswordRequest;
import com.tricenter.dto.request.LoginRequest;
import com.tricenter.dto.request.SelectCityRequest;
import com.tricenter.dto.response.LoginResponse;
import com.tricenter.dto.response.UserResponse;
import com.tricenter.security.LoginUser;
import com.tricenter.security.LoginAttemptService;
import com.tricenter.security.RefreshSessionService;
import com.tricenter.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 */
@Tag(name = "用户认证", description = "登录、登出、用户信息等接口")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshSessionService refreshSessionService;
    private final LoginAttemptService loginAttemptService;

    @Value("${tricenter.auth.secure-cookie:false}")
    private boolean secureCookie;

    @Operation(summary = "用户登录")
    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request,
                                       HttpServletRequest servletRequest,
                                       HttpServletResponse servletResponse) {
        String clientIp = clientIp(servletRequest);
        loginAttemptService.assertAllowed(clientIp, request.getUsername());
        try {
            LoginResponse response = authService.login(request);
            loginAttemptService.recordSuccess(clientIp, request.getUsername());
            RefreshSessionService.IssuedRefreshSession refresh = refreshSessionService.issue(
                    response.getUser().getId(),
                    response.getCurrentCity() == null ? null : response.getCurrentCity().getId(),
                    response.isRequiresCitySelection());
            setSessionCookies(servletResponse, response.getToken(), refresh.rawToken());
            return Result.success(response);
        } catch (com.tricenter.common.exception.BusinessException e) {
            if (e.getCode() == 401) {
                loginAttemptService.recordFailure(clientIp, request.getUsername());
            }
            throw e;
        }
    }

    @Operation(summary = "选择或切换当前城市")
    @PostMapping("/select-city")
    public Result<LoginResponse> selectCity(@AuthenticationPrincipal LoginUser loginUser,
                                            @Valid @RequestBody SelectCityRequest request,
                                            HttpServletRequest servletRequest,
                                            HttpServletResponse servletResponse) {
        LoginResponse response = authService.selectCity(loginUser.getId(), request.getCityId());
        refreshSessionService.revokeAll(loginUser.getId());
        RefreshSessionService.IssuedRefreshSession refresh = refreshSessionService.issue(
                loginUser.getId(), request.getCityId(), false);
        setSessionCookies(servletResponse, response.getToken(), refresh.rawToken());
        return Result.success(response);
    }

    @Operation(summary = "轮换 refresh session 并签发新的 access cookie")
    @PostMapping("/refresh")
    public Result<LoginResponse> refresh(HttpServletRequest servletRequest,
                                         HttpServletResponse servletResponse) {
        RefreshSessionService.IssuedRefreshSession refresh = refreshSessionService.rotate(
                cookie(servletRequest, "TRICENTER_REFRESH"));
        RefreshSessionService.RefreshContext context = refresh.context();
        LoginResponse response = authService.refresh(
                context.userId(), context.currentCityId(), context.citySelectionPending());
        setSessionCookies(servletResponse, response.getToken(), refresh.rawToken());
        return Result.success(response);
    }

    @Operation(summary = "用户登出")
    @PostMapping("/logout")
    public Result<Void> logout(@AuthenticationPrincipal LoginUser loginUser,
                               HttpServletResponse servletResponse) {
        authService.logout(loginUser.getId());
        refreshSessionService.revokeAll(loginUser.getId());
        clearSessionCookies(servletResponse);
        return Result.success();
    }

    @Operation(summary = "获取当前用户信息")
    @GetMapping("/me")
    public Result<UserResponse> getCurrentUser(@AuthenticationPrincipal LoginUser loginUser) {
        UserResponse response = authService.getCurrentUser(
                loginUser.getId(), loginUser.getCurrentCityId());
        return Result.success(response);
    }

    @Operation(summary = "修改密码")
    @PostMapping("/change-password")
    public Result<Void> changePassword(@AuthenticationPrincipal LoginUser loginUser,
                                       @Valid @RequestBody ChangePasswordRequest request,
                                       HttpServletResponse servletResponse) {
        authService.changePassword(loginUser.getId(), request);
        refreshSessionService.revokeAll(loginUser.getId());
        clearSessionCookies(servletResponse);
        return Result.success();
    }

    private void setSessionCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie("TRICENTER_ACCESS", accessToken, "/", 1800).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, cookie("TRICENTER_REFRESH", refreshToken, "/api/auth", 604800).toString());
    }

    private void clearSessionCookies(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie("TRICENTER_ACCESS", "", "/", 0).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, cookie("TRICENTER_REFRESH", "", "/api/auth", 0).toString());
    }

    private ResponseCookie cookie(String name, String value, String path, long maxAgeSeconds) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Strict")
                .path(path)
                .maxAge(maxAgeSeconds)
                .build();
    }

    private String cookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (name.equals(cookie.getName())) return cookie.getValue();
        }
        return null;
    }

    private String clientIp(HttpServletRequest request) {
        // Production uses Tomcat's trusted-proxy RemoteIpValve. Never parse a
        // client-controlled forwarding header in application code.
        return request.getRemoteAddr();
    }
}
