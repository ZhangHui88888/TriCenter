package com.tricenter.service;

import com.tricenter.dto.response.*;
import java.util.List;

/**
 * 看板统计服务接口
 */
public interface DashboardService {
    
    /**
     * 获取统计概览
     */
    DashboardOverviewResponse getOverview();
    
    /**
     * 获取漏斗阶段分布
     */
    List<FunnelStageResponse> getFunnelStats();
    
    /**
     * 获取区域分布
     */
    List<DistrictStatsResponse> getDistrictStats();
    
    /**
     * 获取行业分布
     */
    List<IndustryStatsResponse> getIndustryStats();
    
    /**
     * 获取待跟进提醒
     */
    PendingFollowUpsResponse getPendingFollowUps();

    /**
     * 获取月度新增趋势（最近12个月）
     */
    List<MonthlyTrendResponse> getMonthlyTrend();

    /**
     * 清除所有看板缓存（企业数据变更时调用）
     */
    void evictAllCache();
}
