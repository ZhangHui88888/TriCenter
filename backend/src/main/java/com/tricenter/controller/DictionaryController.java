package com.tricenter.controller;

import com.tricenter.common.result.Result;
import com.tricenter.dto.request.DictionaryRequest;
import com.tricenter.dto.request.DictionaryUpdateRequest;
import com.tricenter.dto.response.CategoryStatsResponse;
import com.tricenter.dto.response.OptionResponse;
import com.tricenter.service.OptionsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 数据字典管理控制器
 */
@Tag(name = "数据字典管理", description = "字典选项的增删改查（管理员功能）")
@RestController
@RequestMapping("/api/dictionary")
@RequiredArgsConstructor
public class DictionaryController {

    private final OptionsService optionsService;

    @Operation(summary = "获取字典分类列表")
    @GetMapping("/categories")
    public Result<List<CategoryStatsResponse>> getDictionaryCategories() {
        List<CategoryStatsResponse> categories = optionsService.getDictionaryCategories();
        return Result.success(categories);
    }

    @Operation(summary = "新增字典选项")
    @PostMapping("/{category}")
    public Result<OptionResponse> addDictionaryOption(
            @Parameter(description = "分类") @PathVariable String category,
            @Valid @RequestBody DictionaryRequest request) {
        OptionResponse response = optionsService.addDictionaryOption(category, request);
        return Result.success(response);
    }

    @Operation(summary = "更新字典选项")
    @PutMapping("/{category}/{id}")
    public Result<OptionResponse> updateDictionaryOption(
            @Parameter(description = "分类") @PathVariable String category,
            @Parameter(description = "选项ID") @PathVariable Integer id,
            @RequestBody DictionaryUpdateRequest request) {
        OptionResponse response = optionsService.updateDictionaryOption(category, id, request);
        return Result.success(response);
    }

    @Operation(summary = "删除字典选项")
    @DeleteMapping("/{category}/{id}")
    public Result<Void> deleteDictionaryOption(
            @Parameter(description = "分类") @PathVariable String category,
            @Parameter(description = "选项ID") @PathVariable Integer id) {
        optionsService.deleteDictionaryOption(category, id);
        return Result.success();
    }
}
