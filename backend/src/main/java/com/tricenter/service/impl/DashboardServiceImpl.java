package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tricenter.dto.response.*;
import com.tricenter.entity.Enterprise;
import com.tricenter.entity.FollowUpRecord;
import com.tricenter.mapper.EnterpriseMapper;
import com.tricenter.mapper.FollowUpRecordMapper;
import com.tricenter.mapper.IndustryCategoryMapper;
import com.tricenter.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 看板统计服务实现
 */
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {
    
    private final EnterpriseMapper enterpriseMapper;
    private final FollowUpRecordMapper followUpRecordMapper;
    private final IndustryCategoryMapper industryCategoryMapper;
    
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
    
    @Override
    public DashboardOverviewResponse getOverview() {
        DashboardOverviewResponse response = new DashboardOverviewResponse();
        
        // 查询各阶段企业数量
        List<Map<String, Object>> stageCounts = enterpriseMapper.countByStage();
        Map<String, Integer> stageMap = new HashMap<>();
        int total = 0;
        for (Map<String, Object> item : stageCounts) {
            String stage = (String) item.get("stage");
            Long count = (Long) item.get("count");
            if (stage != null) {
                stageMap.put(stage, count.intValue());
                total += count.intValue();
            }
        }
        
        response.setTotalEnterprises(total);
        response.setPotentialCount(stageMap.getOrDefault("POTENTIAL", 0));
        response.setHasDemandCount(stageMap.getOrDefault("HAS_DEMAND", 0));
        
        // 已签约入驻数 = 签约 + 入驻 + 孵化
        int signedSettled = stageMap.getOrDefault("SIGNED", 0) 
            + stageMap.getOrDefault("SETTLED", 0) 
            + stageMap.getOrDefault("INCUBATING", 0);
        response.setSignedSettledCount(signedSettled);
        
        // 本月变化统计
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        DashboardOverviewResponse.MonthlyChange monthlyChange = new DashboardOverviewResponse.MonthlyChange();
        
        // 本月新增总数
        LambdaQueryWrapper<Enterprise> totalQuery = new LambdaQueryWrapper<>();
        totalQuery.ge(Enterprise::getCreatedAt, monthStart);
        monthlyChange.setTotal(Math.toIntExact(enterpriseMapper.selectCount(totalQuery)));
        
        // 本月新增潜在
        LambdaQueryWrapper<Enterprise> potentialQuery = new LambdaQueryWrapper<>();
        potentialQuery.ge(Enterprise::getCreatedAt, monthStart)
            .eq(Enterprise::getStage, "POTENTIAL");
        monthlyChange.setPotential(Math.toIntExact(enterpriseMapper.selectCount(potentialQuery)));
        
        // 本月新增有需求
        LambdaQueryWrapper<Enterprise> demandQuery = new LambdaQueryWrapper<>();
        demandQuery.ge(Enterprise::getCreatedAt, monthStart)
            .eq(Enterprise::getStage, "HAS_DEMAND");
        monthlyChange.setHasDemand(Math.toIntExact(enterpriseMapper.selectCount(demandQuery)));
        
        // 本月新增签约入驻
        LambdaQueryWrapper<Enterprise> signedQuery = new LambdaQueryWrapper<>();
        signedQuery.ge(Enterprise::getCreatedAt, monthStart)
            .in(Enterprise::getStage, Arrays.asList("SIGNED", "SETTLED", "INCUBATING"));
        monthlyChange.setSignedSettled(Math.toIntExact(enterpriseMapper.selectCount(signedQuery)));
        
        response.setMonthlyChange(monthlyChange);
        return response;
    }
    
    @Override
    public List<FunnelStageResponse> getFunnelStats() {
        List<Map<String, Object>> stageCounts = enterpriseMapper.countByStage();
        Map<String, Integer> stageMap = new HashMap<>();
        for (Map<String, Object> item : stageCounts) {
            String stage = (String) item.get("stage");
            Long count = (Long) item.get("count");
            if (stage != null) {
                stageMap.put(stage, count.intValue());
            }
        }
        
        // 按固定顺序返回
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
    public List<DistrictStatsResponse> getDistrictStats() {
        List<Map<String, Object>> districtCounts = enterpriseMapper.countByDistrict();
        return districtCounts.stream()
            .filter(item -> item.get("district") != null)
            .map(item -> new DistrictStatsResponse(
                (String) item.get("district"),
                ((Long) item.get("count")).intValue()
            ))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<IndustryStatsResponse> getIndustryStats() {
        List<Map<String, Object>> industryCounts = enterpriseMapper.countByIndustry();
        
        // 计算总数
        int total = industryCounts.stream()
            .mapToInt(item -> ((Long) item.get("count")).intValue())
            .sum();
        
        return industryCounts.stream()
            .map(item -> {
                String name = (String) item.get("name");
                int count = ((Long) item.get("count")).intValue();
                double percentage = total > 0 ? Math.round(count * 1000.0 / total) / 10.0 : 0;
                return new IndustryStatsResponse(name != null ? name : "未分类", count, percentage);
            })
            .collect(Collectors.toList());
    }
    
    @Override
    public PendingFollowUpsResponse getPendingFollowUps() {
        PendingFollowUpsResponse response = new PendingFollowUpsResponse();
        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysAgo = today.minusDays(30);
        
        // 查询所有未删除的企业
        LambdaQueryWrapper<Enterprise> enterpriseQuery = new LambdaQueryWrapper<>();
        enterpriseQuery.select(Enterprise::getId, Enterprise::getName);
        List<Enterprise> enterprises = enterpriseMapper.selectList(enterpriseQuery);
        
        List<PendingFollowUpsResponse.OverdueEnterprise> overdueList = new ArrayList<>();
        
        for (Enterprise enterprise : enterprises) {
            LocalDate lastFollowUp = followUpRecordMapper.getLastFollowUpDate(enterprise.getId());
            
            if (lastFollowUp == null || lastFollowUp.isBefore(thirtyDaysAgo)) {
                PendingFollowUpsResponse.OverdueEnterprise overdue = new PendingFollowUpsResponse.OverdueEnterprise();
                overdue.setId(enterprise.getId());
                overdue.setName(enterprise.getName());
                
                if (lastFollowUp != null) {
                    overdue.setLastFollowUp(lastFollowUp.format(DateTimeFormatter.ISO_DATE));
                    overdue.setDays((int) java.time.temporal.ChronoUnit.DAYS.between(lastFollowUp, today));
                } else {
                    overdue.setLastFollowUp(null);
                    overdue.setDays(999); // 从未跟进
                }
                overdueList.add(overdue);
            }
        }
        
        // 按天数降序排序，取前10条
        overdueList.sort((a, b) -> b.getDays() - a.getDays());
        if (overdueList.size() > 10) {
            overdueList = overdueList.subList(0, 10);
        }
        
        response.setOverdue30Days(overdueList.size());
        response.setOverdueList(overdueList);
        
        // 本周需回访（基于最近跟进记录的next_step字段，简化处理）
        // 这里简化为：查询最近7天有跟进且有下一步计划的企业
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate weekEnd = weekStart.plusDays(6);
        
        LambdaQueryWrapper<FollowUpRecord> followUpQuery = new LambdaQueryWrapper<>();
        followUpQuery.isNotNull(FollowUpRecord::getNextPlan)
            .ne(FollowUpRecord::getNextPlan, "")
            .orderByDesc(FollowUpRecord::getFollowDate)
            .last("LIMIT 20");
        
        List<FollowUpRecord> recentFollowUps = followUpRecordMapper.selectList(followUpQuery);
        
        // 去重，每个企业只取最新一条
        Map<Integer, FollowUpRecord> enterpriseFollowUpMap = new LinkedHashMap<>();
        for (FollowUpRecord record : recentFollowUps) {
            if (!enterpriseFollowUpMap.containsKey(record.getEnterpriseId())) {
                enterpriseFollowUpMap.put(record.getEnterpriseId(), record);
            }
        }
        
        List<PendingFollowUpsResponse.WeeklyEnterprise> weeklyList = new ArrayList<>();
        for (Map.Entry<Integer, FollowUpRecord> entry : enterpriseFollowUpMap.entrySet()) {
            if (weeklyList.size() >= 5) break;
            
            FollowUpRecord record = entry.getValue();
            Enterprise enterprise = enterpriseMapper.selectById(record.getEnterpriseId());
            if (enterprise != null) {
                PendingFollowUpsResponse.WeeklyEnterprise weekly = new PendingFollowUpsResponse.WeeklyEnterprise();
                weekly.setId(enterprise.getId());
                weekly.setName(enterprise.getName());
                weekly.setNextFollowUp(record.getFollowDate().plusDays(7).format(DateTimeFormatter.ISO_DATE));
                weekly.setType(record.getNextPlan());
                weeklyList.add(weekly);
            }
        }
        
        response.setNeedFollowThisWeek(weeklyList.size());
        response.setWeeklyList(weeklyList);
        
        return response;
    }
}
