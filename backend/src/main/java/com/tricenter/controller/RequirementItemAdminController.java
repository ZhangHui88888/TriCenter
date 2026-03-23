package com.tricenter.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tricenter.common.result.Result;
import com.tricenter.dto.response.RequirementItemAdminResponse;
import com.tricenter.entity.Requirement;
import com.tricenter.mapper.RequirementMapper;
import com.tricenter.service.RequirementDimensionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 数据字典：标准需求项 + 企业画像维度映射维护
 */
@Tag(name = "数据字典-需求项", description = "需求项列表及 requirement_dimension_mapping 维护")
@RestController
@RequestMapping("/api/dictionary/requirement-items")
@RequiredArgsConstructor
public class RequirementItemAdminController {

    private final RequirementMapper requirementMapper;
    private final RequirementDimensionService requirementDimensionService;

    @Operation(summary = "标准需求项列表（非自定义）")
    @GetMapping
    public Result<List<RequirementItemAdminResponse>> list() {
        List<Requirement> rows = requirementMapper.selectList(
                new LambdaQueryWrapper<Requirement>()
                        .eq(Requirement::getIsCustom, 0)
                        .eq(Requirement::getIsEnabled, 1)
                        .orderByAsc(Requirement::getSortOrder)
                        .orderByAsc(Requirement::getId)
        );
        List<RequirementItemAdminResponse> list = rows.stream().map(r -> {
            Map<String, List<String>> dims = requirementDimensionService.getDimensionsForRequirement(r.getId());
            return RequirementItemAdminResponse.builder()
                    .id(r.getId())
                    .name(r.getName())
                    .phase(r.getPhase())
                    .category(r.getCategory())
                    .sortOrder(r.getSortOrder())
                    .dimensions(new LinkedHashMap<>(dims))
                    .build();
        }).collect(Collectors.toList());
        return Result.success(list);
    }

    @Operation(summary = "获取某需求项的画像维度配置")
    @GetMapping("/{id}/dimensions")
    public Result<Map<String, List<String>>> getDimensions(@PathVariable String id) {
        if (!StringUtils.hasText(id)) {
            return Result.error("无效 id");
        }
        return Result.success(requirementDimensionService.getDimensionsForRequirement(id.trim()));
    }

    @Operation(summary = "覆盖保存某需求项的画像维度（与前端企业画像维度 key 一致）")
    @PutMapping("/{id}/dimensions")
    public Result<Void> putDimensions(
            @PathVariable String id,
            @RequestBody Map<String, List<String>> body
    ) {
        if (!StringUtils.hasText(id)) {
            return Result.error("无效 id");
        }
        requirementDimensionService.replaceDimensionsForRequirement(id.trim(), body != null ? body : Map.of());
        return Result.success();
    }
}
