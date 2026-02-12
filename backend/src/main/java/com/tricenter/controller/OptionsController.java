package com.tricenter.controller;

import com.tricenter.common.result.Result;
import com.tricenter.dto.response.*;
import com.tricenter.service.OptionsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 基础数据控制器
 */
@Tag(name = "基础数据", description = "系统选项、行业分类、产品品类等接口")
@RestController
@RequestMapping("/api/options")
@RequiredArgsConstructor
public class OptionsController {

    private final OptionsService optionsService;

    @Operation(summary = "获取系统选项列表")
    @GetMapping("/{category}")
    public Result<List<OptionResponse>> getOptionsByCategory(
            @Parameter(description = "分类: stage/district/staff_size/revenue/source等")
            @PathVariable String category) {
        List<OptionResponse> options = optionsService.getOptionsByCategory(category);
        return Result.success(options);
    }

    @Operation(summary = "获取行业分类树")
    @GetMapping("/industries")
    public Result<List<TreeNodeResponse>> getIndustryTree() {
        List<TreeNodeResponse> tree = optionsService.getIndustryTree();
        return Result.success(tree);
    }

    @Operation(summary = "获取产品品类树")
    @GetMapping("/product-categories")
    public Result<List<TreeNodeResponse>> getProductCategoryTree() {
        List<TreeNodeResponse> tree = optionsService.getProductCategoryTree();
        return Result.success(tree);
    }

    @Operation(summary = "获取用户列表（对接人）")
    @GetMapping("/users")
    public Result<List<UserOptionResponse>> getUserOptions() {
        List<UserOptionResponse> users = optionsService.getUserOptions();
        return Result.success(users);
    }
}
