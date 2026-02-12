package com.tricenter.controller;

import com.tricenter.common.result.Result;
import com.tricenter.dto.request.ChangePasswordRequest;
import com.tricenter.dto.request.LoginRequest;
import com.tricenter.dto.response.LoginResponse;
import com.tricenter.dto.response.UserResponse;
import com.tricenter.security.LoginUser;
import com.tricenter.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

    @Operation(summary = "用户登录")
    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return Result.success(response);
    }

    @Operation(summary = "用户登出")
    @PostMapping("/logout")
    public Result<Void> logout(@AuthenticationPrincipal LoginUser loginUser) {
        authService.logout(loginUser.getId());
        return Result.success();
    }

    @Operation(summary = "获取当前用户信息")
    @GetMapping("/me")
    public Result<UserResponse> getCurrentUser(@AuthenticationPrincipal LoginUser loginUser) {
        UserResponse response = authService.getCurrentUser(loginUser.getId());
        return Result.success(response);
    }

    @Operation(summary = "修改密码")
    @PostMapping("/change-password")
    public Result<Void> changePassword(@AuthenticationPrincipal LoginUser loginUser,
                                       @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(loginUser.getId(), request);
        return Result.success();
    }
}
