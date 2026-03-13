package com.tricenter.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tricenter.common.result.Result;
import com.tricenter.entity.MarketReport;
import com.tricenter.service.MarketReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 市场调研报告控制器
 */
@Tag(name = "市场调研报告", description = "市场调研报告CRUD")
@RestController
@RequestMapping("/api/market-reports")
@RequiredArgsConstructor
public class MarketReportController {

    private final MarketReportService marketReportService;

    @Operation(summary = "创建报告", description = "为指定企业创建市场调研报告")
    @PostMapping
    public Result<MarketReport> create(@RequestBody Map<String, Long> body) {
        Long enterpriseId = body.get("enterpriseId");
        Long createdBy = body.getOrDefault("createdBy", 1L);
        MarketReport report = marketReportService.create(enterpriseId, createdBy);
        return Result.success(report);
    }

    @Operation(summary = "获取报告详情")
    @GetMapping("/{id}")
    public Result<MarketReport> getById(@PathVariable Long id) {
        MarketReport report = marketReportService.getById(id);
        if (report == null) {
            return Result.error("报告不存在");
        }
        return Result.success(report);
    }

    @Operation(summary = "获取企业的报告列表")
    @GetMapping("/enterprise/{enterpriseId}")
    public Result<Page<MarketReport>> getByEnterpriseId(
            @PathVariable Long enterpriseId,
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页条数") @RequestParam(defaultValue = "10") int size) {
        Page<MarketReport> result = marketReportService.getByEnterpriseId(enterpriseId, page, size);
        return Result.success(result);
    }

    @Operation(summary = "更新报告内容")
    @PutMapping("/{id}/data")
    public Result<Void> updateReportData(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String reportData = body.get("reportData");
        marketReportService.updateReportData(id, reportData);
        return Result.success(null);
    }

    @Operation(summary = "更新报告状态")
    @PatchMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        marketReportService.updateStatus(id, status);
        return Result.success(null);
    }

    @Operation(summary = "更新AI已生成章节")
    @PatchMapping("/{id}/ai-sections")
    public Result<Void> updateAiSections(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String sections = body.get("aiGeneratedSections");
        marketReportService.updateAiSections(id, sections);
        return Result.success(null);
    }

    @Operation(summary = "删除报告")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        marketReportService.delete(id);
        return Result.success(null);
    }
}
