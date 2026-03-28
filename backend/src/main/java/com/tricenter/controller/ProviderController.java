package com.tricenter.controller;

import com.tricenter.common.result.PageResult;
import com.tricenter.common.result.Result;
import com.tricenter.dto.request.ProviderCreateRequest;
import com.tricenter.dto.request.ProviderQueryRequest;
import com.tricenter.dto.request.ProviderUpdateRequest;
import com.tricenter.dto.response.ProviderDetailResponse;
import com.tricenter.dto.response.ProviderListResponse;
import com.tricenter.entity.Provider;
import com.tricenter.service.ProviderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 服务商管理控制器
 */
@Tag(name = "服务商管理", description = "服务商CRUD、联系人管理等")
@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
public class ProviderController {

    private final ProviderService providerService;

    @Operation(summary = "服务商列表", description = "分页查询服务商列表，支持多条件筛选")
    @GetMapping
    public Result<PageResult<ProviderListResponse>> getProviderList(ProviderQueryRequest request) {
        PageResult<ProviderListResponse> result = providerService.getProviderList(request);
        return Result.success(result);
    }

    @Operation(summary = "服务商详情", description = "获取单个服务商的完整信息")
    @GetMapping("/{id}")
    public Result<ProviderDetailResponse> getProviderDetail(
            @Parameter(description = "服务商ID") @PathVariable Integer id) {
        ProviderDetailResponse detail = providerService.getProviderDetail(id);
        return Result.success(detail);
    }

    @Operation(summary = "新增服务商", description = "创建新服务商记录")
    @PostMapping
    public Result<Provider> createProvider(@Valid @RequestBody ProviderCreateRequest request) {
        Provider provider = providerService.createProvider(request);
        return Result.success(provider);
    }

    @Operation(summary = "编辑服务商", description = "更新服务商信息")
    @PutMapping("/{id}")
    public Result<Provider> updateProvider(
            @Parameter(description = "服务商ID") @PathVariable Integer id,
            @Valid @RequestBody ProviderUpdateRequest request) {
        Provider provider = providerService.updateProvider(id, request);
        return Result.success(provider);
    }

    @Operation(summary = "删除服务商", description = "软删除服务商记录")
    @DeleteMapping("/{id}")
    public Result<Void> deleteProvider(
            @Parameter(description = "服务商ID") @PathVariable Integer id) {
        providerService.deleteProvider(id);
        return Result.success();
    }
}
