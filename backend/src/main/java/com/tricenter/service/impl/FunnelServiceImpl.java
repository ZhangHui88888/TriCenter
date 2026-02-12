package com.tricenter.service.impl;

import com.tricenter.dto.response.FunnelConversionResponse;
import com.tricenter.dto.response.FunnelStageResponse;
import com.tricenter.dto.response.FunnelTrendResponse;
import com.tricenter.mapper.EnterpriseMapper;
import com.tricenter.mapper.StageChangeLogMapper;
import com.tricenter.service.FunnelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 漏斗分析服务实现
 */
@Service
@RequiredArgsConstructor
public class FunnelServiceImpl implements FunnelService {
    
    private final EnterpriseMapper enterpriseMapper;
    private final StageChangeLogMapper stageChangeLogMapper;
    
    // 漏斗阶段配置
    private static final Map<String, String> STAGE_NAMES = new LinkedHashMap<>();
    private static final Map<String, String> STAGE_COLORS = new LinkedHashMap<>();
    
    static {
        STAGE_NAMES.put("POTENTIAL", "潜在企业");
        STAGE_NAMES.put("NO_DEMAND", "无明确需求");
        STAGE_NAMES.put("NO_INTENTION", "没有合作意向");
        STAGE_NAMES.put("HAS_DEMAND", "有明确需求");
        STAGE_NAMES.put("SIGNED", "已签约");
        STAGE_NAMES.put("SETTLED", "已入驻");
        STAGE_NAMES.put("INCUBATING", "重点孵化");
        
        STAGE_COLORS.put("POTENTIAL", "#94a3b8");
        STAGE_COLORS.put("NO_DEMAND", "#fbbf24");
        STAGE_COLORS.put("NO_INTENTION", "#ef4444");
        STAGE_COLORS.put("HAS_DEMAND", "#3b82f6");
        STAGE_COLORS.put("SIGNED", "#8b5cf6");
        STAGE_COLORS.put("SETTLED", "#10b981");
        STAGE_COLORS.put("INCUBATING", "#f97316");
    }
    
    // 转化路径定义
    private static final List<String[]> CONVERSION_PATHS = Arrays.asList(
        new String[]{"POTENTIAL", "HAS_DEMAND"},
        new String[]{"POTENTIAL", "NO_DEMAND"},
        new String[]{"NO_DEMAND", "HAS_DEMAND"},
        new String[]{"NO_DEMAND", "NO_INTENTION"},
        new String[]{"HAS_DEMAND", "SIGNED"},
        new String[]{"SIGNED", "SETTLED"},
        new String[]{"SETTLED", "INCUBATING"}
    );
    
    @Override
    public List<FunnelStageResponse> getFunnelData() {
        List<Map<String, Object>> stageCounts = enterpriseMapper.countByStage();
        Map<String, Integer> stageMap = new HashMap<>();
        for (Map<String, Object> item : stageCounts) {
            String stage = (String) item.get("stage");
            Long count = (Long) item.get("count");
            if (stage != null) {
                stageMap.put(stage, count.intValue());
            }
        }
        
        List<FunnelStageResponse> result = new ArrayList<>();
        for (String stage : STAGE_NAMES.keySet()) {
            result.add(new FunnelStageResponse(
                stage,
                STAGE_NAMES.get(stage),
                stageMap.getOrDefault(stage, 0),
                STAGE_COLORS.get(stage)
            ));
        }
        return result;
    }
    
    @Override
    public List<FunnelConversionResponse> getConversionRates() {
        // 获取各阶段当前数量
        Map<String, Integer> stageMap = new HashMap<>();
        List<Map<String, Object>> stageCounts = enterpriseMapper.countByStage();
        for (Map<String, Object> item : stageCounts) {
            String stage = (String) item.get("stage");
            Long count = (Long) item.get("count");
            if (stage != null) {
                stageMap.put(stage, count.intValue());
            }
        }
        
        // 获取阶段变更记录统计
        List<Map<String, Object>> changeStats = stageChangeLogMapper.countByTransition();
        Map<String, Integer> transitionMap = new HashMap<>();
        for (Map<String, Object> item : changeStats) {
            String fromStage = (String) item.get("from_stage");
            String toStage = (String) item.get("to_stage");
            Long count = (Long) item.get("count");
            if (fromStage != null && toStage != null) {
                transitionMap.put(fromStage + "->" + toStage, count.intValue());
            }
        }
        
        List<FunnelConversionResponse> result = new ArrayList<>();
        for (String[] path : CONVERSION_PATHS) {
            String from = path[0];
            String to = path[1];
            
            // 转化数量：从变更记录中获取，如果没有则用目标阶段当前数量
            int transitionCount = transitionMap.getOrDefault(from + "->" + to, 0);
            int fromCount = stageMap.getOrDefault(from, 0);
            
            // 如果没有变更记录，使用当前阶段数量估算
            if (transitionCount == 0) {
                transitionCount = stageMap.getOrDefault(to, 0);
            }
            
            // 计算转化率
            double rate = 0;
            if (fromCount > 0) {
                rate = Math.round(transitionCount * 1000.0 / fromCount) / 10.0;
            }
            
            result.add(new FunnelConversionResponse(
                from,
                to,
                STAGE_NAMES.get(from),
                STAGE_NAMES.get(to),
                transitionCount,
                rate
            ));
        }
        
        return result;
    }

    
    @Override
    public List<FunnelTrendResponse> getTrendData(LocalDate startDate, LocalDate endDate) {
        // 默认查询最近6个月
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(5).withDayOfMonth(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        List<FunnelTrendResponse> result = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        
        // 按月统计
        YearMonth current = YearMonth.from(startDate);
        YearMonth end = YearMonth.from(endDate);
        
        while (!current.isAfter(end)) {
            LocalDate monthStart = current.atDay(1);
            LocalDate monthEnd = current.atEndOfMonth();
            
            // 查询该月末各阶段的企业数量（创建时间在该月末之前的企业）
            Map<String, Integer> monthStats = getStageCountsAtDate(monthEnd);
            
            FunnelTrendResponse trend = new FunnelTrendResponse();
            trend.setMonth(current.format(formatter));
            trend.setPotential(monthStats.getOrDefault("POTENTIAL", 0));
            trend.setHasDemand(monthStats.getOrDefault("HAS_DEMAND", 0));
            trend.setSigned(monthStats.getOrDefault("SIGNED", 0));
            trend.setSettled(monthStats.getOrDefault("SETTLED", 0));
            trend.setIncubating(monthStats.getOrDefault("INCUBATING", 0));
            
            result.add(trend);
            current = current.plusMonths(1);
        }
        
        return result;
    }
    
    /**
     * 获取指定日期时各阶段的企业数量
     */
    private Map<String, Integer> getStageCountsAtDate(LocalDate date) {
        Map<String, Integer> result = new HashMap<>();
        
        // 查询在指定日期之前创建的企业的当前阶段分布
        // 简化处理：使用当前阶段数据，按创建时间过滤
        List<Map<String, Object>> counts = enterpriseMapper.countByStageBeforeDate(date.atTime(23, 59, 59));
        
        for (Map<String, Object> item : counts) {
            String stage = (String) item.get("stage");
            Long count = (Long) item.get("count");
            if (stage != null) {
                result.put(stage, count.intValue());
            }
        }
        
        return result;
    }
}
