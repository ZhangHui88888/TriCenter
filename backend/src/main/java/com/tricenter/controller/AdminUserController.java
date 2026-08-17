package com.tricenter.controller;

import com.tricenter.common.result.Result;
import com.tricenter.dto.request.AdminUserCreateRequest;
import com.tricenter.dto.request.AdminUserUpdateRequest;
import com.tricenter.dto.request.ResetPasswordRequest;
import com.tricenter.dto.response.AdminUserResponse;
import com.tricenter.dto.response.CityInfoResponse;
import com.tricenter.security.CityContext;
import com.tricenter.service.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "用户与城市权限", description = "系统管理员维护账号和城市授权")
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('user:manage')")
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final CityContext cityContext;

    @Operation(summary = "用户列表")
    @GetMapping
    public Result<List<AdminUserResponse>> listUsers() {
        return Result.success(adminUserService.listUsers());
    }

    @Operation(summary = "可授权城市列表")
    @GetMapping("/cities")
    public Result<List<CityInfoResponse>> listCities() {
        return Result.success(adminUserService.listCities());
    }

    @Operation(summary = "创建用户")
    @PostMapping
    public Result<AdminUserResponse> createUser(
            @Valid @RequestBody AdminUserCreateRequest request) {
        return Result.success(adminUserService.createUser(request));
    }

    @Operation(summary = "修改用户和城市权限")
    @PutMapping("/{id}")
    public Result<AdminUserResponse> updateUser(
            @PathVariable Integer id,
            @Valid @RequestBody AdminUserUpdateRequest request) {
        return Result.success(adminUserService.updateUser(
                id, request, cityContext.getUserId(), cityContext.requireCityId()));
    }

    @Operation(summary = "重置用户密码")
    @PostMapping("/{id}/reset-password")
    public Result<Void> resetPassword(
            @PathVariable Integer id,
            @Valid @RequestBody ResetPasswordRequest request) {
        adminUserService.resetPassword(id, request.getNewPassword());
        return Result.success();
    }
}
