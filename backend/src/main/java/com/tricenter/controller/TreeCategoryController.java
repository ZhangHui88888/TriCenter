package com.tricenter.controller;

import com.tricenter.common.result.Result;
import com.tricenter.dto.request.TreeCategoryCreateRequest;
import com.tricenter.dto.request.TreeCategoryUpdateRequest;
import com.tricenter.dto.response.TreeCategoryResponse;
import com.tricenter.service.TreeCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "树形分类管理", description = "行业分类、产品品类、需求分类的 CRUD")
@RestController
@RequestMapping("/api/tree-categories")
@RequiredArgsConstructor
public class TreeCategoryController {

    private final TreeCategoryService treeCategoryService;

    @Operation(summary = "获取全部分类节点（扁平列表，含禁用）")
    @GetMapping("/{type}")
    public Result<List<TreeCategoryResponse>> listAll(
            @Parameter(description = "分类类型: industry / product / requirement")
            @PathVariable String type) {
        return Result.success(treeCategoryService.listAll(type));
    }

    @Operation(summary = "新增分类节点")
    @PostMapping("/{type}")
    public Result<TreeCategoryResponse> create(
            @PathVariable String type,
            @Valid @RequestBody TreeCategoryCreateRequest request) {
        return Result.success(treeCategoryService.create(type, request));
    }

    @Operation(summary = "更新分类节点")
    @PutMapping("/{type}/{id}")
    public Result<TreeCategoryResponse> update(
            @PathVariable String type,
            @PathVariable Integer id,
            @Valid @RequestBody TreeCategoryUpdateRequest request) {
        return Result.success(treeCategoryService.update(type, id, request));
    }

    @Operation(summary = "删除分类节点")
    @DeleteMapping("/{type}/{id}")
    public Result<Void> delete(
            @PathVariable String type,
            @PathVariable Integer id) {
        treeCategoryService.delete(type, id);
        return Result.success(null);
    }

    @Operation(summary = "恢复默认数据（清空并重新插入种子数据）")
    @PostMapping("/{type}/reset")
    public Result<List<TreeCategoryResponse>> resetToDefault(@PathVariable String type) {
        treeCategoryService.resetToDefault(type);
        return Result.success(treeCategoryService.listAll(type));
    }
}
