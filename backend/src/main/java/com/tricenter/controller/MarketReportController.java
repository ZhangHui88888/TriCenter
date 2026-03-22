package com.tricenter.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tricenter.common.result.Result;
import com.tricenter.entity.MarketReport;
import com.tricenter.mapper.MarketReportMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@Tag(name = "市场调研报告")
@RestController
@RequestMapping("/api/market-reports")
@RequiredArgsConstructor
public class MarketReportController {

    private final MarketReportMapper reportMapper;

    @Operation(summary = "查询企业已有报告")
    @GetMapping("/{enterpriseId}")
    public Result<MarketReport> getReport(@PathVariable Integer enterpriseId) {
        MarketReport report = reportMapper.selectOne(
                new LambdaQueryWrapper<MarketReport>()
                        .eq(MarketReport::getEnterpriseId, enterpriseId));
        return Result.success(report);
    }

    @Operation(summary = "保存/覆盖报告")
    @PutMapping("/{enterpriseId}/{version}")
    public Result<Void> saveReport(@PathVariable Integer enterpriseId,
                                   @PathVariable String version,
                                   @RequestBody Map<String, Object> reportData) {
        MarketReport report = reportMapper.selectOne(
                new LambdaQueryWrapper<MarketReport>()
                        .eq(MarketReport::getEnterpriseId, enterpriseId));

        if (report == null) {
            report = new MarketReport();
            report.setEnterpriseId(enterpriseId);
        }

        if ("basic".equals(version)) {
            report.setBasicReportData(reportData);
            report.setBasicGeneratedAt(LocalDateTime.now());
        } else if ("deep".equals(version)) {
            report.setDeepReportData(reportData);
            report.setDeepGeneratedAt(LocalDateTime.now());
        } else {
            return Result.error("version 必须是 basic 或 deep");
        }

        if (report.getId() == null) {
            reportMapper.insert(report);
        } else {
            reportMapper.updateById(report);
        }

        return Result.success(null);
    }
}
