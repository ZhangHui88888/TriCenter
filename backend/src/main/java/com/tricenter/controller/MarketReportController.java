package com.tricenter.controller;

import com.tricenter.common.result.Result;
import com.tricenter.entity.MarketReport;
import com.tricenter.service.MarketReportService;
import com.tricenter.service.AiMarketReportService;
import com.tricenter.dto.request.AiReportGenerateRequest;
import com.tricenter.security.LoginUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "市场调研报告")
@RestController
@RequestMapping("/api/market-reports")
@RequiredArgsConstructor
public class MarketReportController {

    private final MarketReportService marketReportService;
    private final AiMarketReportService aiMarketReportService;

    @Operation(summary = "查询企业已有报告")
    @GetMapping("/{enterpriseId}")
    @PreAuthorize("hasAuthority('report:view')")
    public Result<MarketReport> getReport(@PathVariable Integer enterpriseId) {
        return Result.success(marketReportService.getByEnterpriseId(enterpriseId));
    }

    @Operation(summary = "保存/覆盖报告")
    @PutMapping("/{enterpriseId}/{version}")
    @PreAuthorize("hasAuthority('report:generate')")
    public Result<Void> saveReport(@PathVariable Integer enterpriseId,
                                   @PathVariable String version,
                                   @RequestBody Map<String, Object> reportData) {
        marketReportService.upsert(enterpriseId, version, reportData);
        return Result.success(null);
    }

    @Operation(summary = "使用本次请求提供的 Key 生成 AI 报告")
    @PostMapping("/ai/generate")
    @PreAuthorize("hasAuthority('report:generate')")
    public Result<Map<String, Object>> generate(
            @AuthenticationPrincipal LoginUser loginUser,
            @Valid @RequestBody AiReportGenerateRequest request) {
        return Result.success(aiMarketReportService.generate(loginUser.getId(), request));
    }
}
