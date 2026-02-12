package com.tricenter.controller;

import com.tricenter.common.result.Result;
import com.tricenter.dto.response.*;
import com.tricenter.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 看板统计控制器
 */
@Tag(name = "看板统计", description = "首页Dashboard数据统计")
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    @Operation(summary = "6.1 统计概览", description = "获取首页统计卡片数据")
    @GetMapping("/overview")
    public Result<DashboardOverviewResponse> getOverview() {
        return Result.success(dashboardService.getOverview());
    }
    
    @Operation(summary = "6.2 漏斗阶段分布", description = "获取漏斗各阶段企业数量")
    @GetMapping("/funnel")
    public Result<List<FunnelStageResponse>> getFunnelStats() {
        return Result.success(dashboardService.getFunnelStats());
    }
    
    @Operation(summary = "6.3 区域分布", description = "获取各区域企业数量分布")
    @GetMapping("/districts")
    public Result<List<DistrictStatsResponse>> getDistrictStats() {
        return Result.success(dashboardService.getDistrictStats());
    }
    
    @Operation(summary = "6.4 行业分布", description = "获取各行业企业数量及占比")
    @GetMapping("/industries")
    public Result<List<IndustryStatsResponse>> getIndustryStats() {
        return Result.success(dashboardService.getIndustryStats());
    }
    
    @Operation(summary = "6.5 待跟进提醒", description = "获取超过30天未跟进、本周需回访企业")
    @GetMapping("/pending-follow-ups")
    public Result<PendingFollowUpsResponse> getPendingFollowUps() {
        return Result.success(dashboardService.getPendingFollowUps());
    }
}
