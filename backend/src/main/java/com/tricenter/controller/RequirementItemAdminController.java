package com.tricenter.controller;

import com.tricenter.common.result.Result;
import com.tricenter.dto.response.RequirementItemAdminResponse;
import com.tricenter.service.RequirementDimensionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
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

    private final RequirementDimensionService requirementDimensionService;
    private final JdbcTemplate jdbcTemplate;

    @Operation(summary = "标准需求项列表（非自定义）")
    @GetMapping
    public Result<List<RequirementItemAdminResponse>> list() {
        boolean hasRecommendedColumn = hasRecommendedColumn();
        String sql = hasRecommendedColumn
                ? "SELECT id, name, phase, category, sort_order, COALESCE(is_recommended, 0) AS is_recommended FROM requirements WHERE is_custom = 0 AND is_enabled = 1 ORDER BY sort_order ASC, id ASC"
                : "SELECT id, name, phase, category, sort_order, 0 AS is_recommended FROM requirements WHERE is_custom = 0 AND is_enabled = 1 ORDER BY sort_order ASC, id ASC";
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        List<RequirementItemAdminResponse> list = rows.stream().map(r -> {
            String requirementId = String.valueOf(r.get("id"));
            Map<String, List<String>> dims = requirementDimensionService.getDimensionsForRequirement(requirementId);
            return RequirementItemAdminResponse.builder()
                    .id(requirementId)
                    .name(r.get("name") != null ? String.valueOf(r.get("name")) : "")
                    .phase(r.get("phase") != null ? String.valueOf(r.get("phase")) : "")
                    .category(r.get("category") != null ? String.valueOf(r.get("category")) : "")
                    .sortOrder(r.get("sort_order") instanceof Number ? ((Number) r.get("sort_order")).intValue() : null)
                    .isRecommended(r.get("is_recommended") instanceof Number ? ((Number) r.get("is_recommended")).intValue() : 0)
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

    @Operation(summary = "获取某需求项推荐状态")
    @GetMapping("/{id}/recommended")
    public Result<Map<String, Integer>> getRecommended(@PathVariable String id) {
        if (!StringUtils.hasText(id)) {
            return Result.error("无效 id");
        }
        if (!hasRecommendedColumn()) {
            return Result.success(Map.of("isRecommended", 0));
        }
        List<Integer> values = jdbcTemplate.query(
                "SELECT COALESCE(is_recommended, 0) FROM requirements WHERE id = ?",
                (rs, rowNum) -> rs.getInt(1),
                id.trim()
        );
        if (values.isEmpty()) {
            return Result.error(404, "需求不存在");
        }
        return Result.success(Map.of("isRecommended", values.get(0)));
    }

    @Operation(summary = "切换需求项推荐状态")
    @PatchMapping("/{id}/recommended")
    public Result<Void> toggleRecommended(
            @PathVariable String id,
            @RequestBody Map<String, Object> body
    ) {
        if (!StringUtils.hasText(id)) {
            return Result.error("无效 id");
        }
        if (!hasRecommendedColumn()) {
            return Result.badRequest("数据库缺少 requirements.is_recommended 字段，请执行 docs/sql/scripts/06_add_requirement_recommended.sql");
        }
        Object val = body.get("isRecommended");
        int recommended = (val instanceof Boolean) ? ((Boolean) val ? 1 : 0)
                : (val instanceof Number) ? ((Number) val).intValue() : 0;
        int updated = jdbcTemplate.update(
                "UPDATE requirements SET is_recommended = ? WHERE id = ?",
                recommended,
                id.trim()
        );
        if (updated == 0) {
            return Result.error(404, "需求不存在");
        }
        return Result.success();
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

    private boolean hasRecommendedColumn() {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'requirements' AND COLUMN_NAME = 'is_recommended'",
                Integer.class
        );
        return count != null && count > 0;
    }
}
