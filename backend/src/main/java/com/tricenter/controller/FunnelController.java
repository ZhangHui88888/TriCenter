package com.tricenter.controller;

import com.tricenter.common.result.Result;
import com.tricenter.dto.response.FunnelConversionResponse;
import com.tricenter.dto.response.FunnelStageResponse;
import com.tricenter.dto.response.FunnelTrendResponse;
import com.tricenter.service.FunnelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 漏斗分析控制器
 */
@Tag(name = "漏斗分析", description = "漏斗转化分析相关接口")
@RestController
@RequestMapping("/api/funnel")
@RequiredArgsConstructor
public class FunnelController {
    
    private final FunnelService funnelService;
    
    @Operation(summary = "7.1 漏斗数据", description = "获取漏斗各阶段企业数量")
    @GetMapping("/data")
    public Result<List<FunnelStageResponse>> getFunnelData() {
        return Result.success(funnelService.getFunnelData());
    }
    
    @Operation(summary = "7.2 转化率数据", description = "获取各阶段间的转化数量和转化率")
    @GetMapping("/conversion")
    public Result<List<FunnelConversionResponse>> getConversionRates() {
        return Result.success(funnelService.getConversionRates());
    }
    
    @Operation(summary = "7.3 趋势数据", description = "获取各阶段企业数量的月度趋势")
    @GetMapping("/trend")
    public Result<List<FunnelTrendResponse>> getTrendData(
            @Parameter(description = "开始日期（格式：yyyy-MM-dd）")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "结束日期（格式：yyyy-MM-dd）")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return Result.success(funnelService.getTrendData(startDate, endDate));
    }
}
