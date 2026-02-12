package com.tricenter.service;

import com.tricenter.dto.response.FunnelConversionResponse;
import com.tricenter.dto.response.FunnelStageResponse;
import com.tricenter.dto.response.FunnelTrendResponse;

import java.time.LocalDate;
import java.util.List;

/**
 * 漏斗分析服务接口
 */
public interface FunnelService {
    
    /**
     * 获取漏斗数据（各阶段企业数量）
     */
    List<FunnelStageResponse> getFunnelData();
    
    /**
     * 获取转化率数据
     */
    List<FunnelConversionResponse> getConversionRates();
    
    /**
     * 获取趋势数据
     * @param startDate 开始日期
     * @param endDate 结束日期
     */
    List<FunnelTrendResponse> getTrendData(LocalDate startDate, LocalDate endDate);
}
