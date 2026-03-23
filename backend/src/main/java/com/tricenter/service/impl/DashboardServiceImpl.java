package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tricenter.dto.response.*;
import com.tricenter.entity.Enterprise;
import com.tricenter.entity.FollowUpRecord;
import com.tricenter.mapper.EnterpriseMapper;
import com.tricenter.mapper.FollowUpRecordMapper;
import com.tricenter.service.DashboardService;
import com.tricenter.service.DictionaryCacheService;
import com.tricenter.util.StageCodeUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * 看板统计服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {
    
    private final EnterpriseMapper enterpriseMapper;
    private final FollowUpRecordMapper followUpRecordMapper;
    private final DictionaryCacheService dictionaryCache;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String CACHE_PREFIX = "dashboard:";
    private static final long CACHE_TTL_MINUTES = 10;
    
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
        String cacheKey = CACHE_PREFIX + "overview";
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return objectMapper.convertValue(cached, DashboardOverviewResponse.class);
        }

        DashboardOverviewResponse response = doGetOverview();
        redisTemplate.opsForValue().set(cacheKey, response, CACHE_TTL_MINUTES, TimeUnit.MINUTES);
        return response;
    }

    private DashboardOverviewResponse doGetOverview() {
        DashboardOverviewResponse response = new DashboardOverviewResponse();
        
        // 查询各阶段企业数量
        List<Map<String, Object>> stageCounts = enterpriseMapper.countByStage();
        Map<String, Integer> stageMap = new HashMap<>();
        int total = 0;
        for (Map<String, Object> item : stageCounts) {
            String stage = (String) item.get("stage");
            Long count = (Long) item.get("count");
            if (stage != null && count != null) {
                String key = StageCodeUtil.normalize(stage);
                int n = count.intValue();
                stageMap.merge(key, n, Integer::sum);
                total += n;
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
        
        // 本月新增潜在（兼容库中小写 stage）
        LambdaQueryWrapper<Enterprise> potentialQuery = new LambdaQueryWrapper<>();
        potentialQuery.ge(Enterprise::getCreatedAt, monthStart)
            .in(Enterprise::getStage, StageCodeUtil.variantsForDbMatch("POTENTIAL"));
        monthlyChange.setPotential(Math.toIntExact(enterpriseMapper.selectCount(potentialQuery)));
        
        // 本月新增有需求
        LambdaQueryWrapper<Enterprise> demandQuery = new LambdaQueryWrapper<>();
        demandQuery.ge(Enterprise::getCreatedAt, monthStart)
            .in(Enterprise::getStage, StageCodeUtil.variantsForDbMatch("HAS_DEMAND"));
        monthlyChange.setHasDemand(Math.toIntExact(enterpriseMapper.selectCount(demandQuery)));
        
        // 本月新增签约入驻
        LambdaQueryWrapper<Enterprise> signedQuery = new LambdaQueryWrapper<>();
        signedQuery.ge(Enterprise::getCreatedAt, monthStart)
            .in(Enterprise::getStage, java.util.stream.Stream.of("SIGNED", "SETTLED", "INCUBATING")
                .flatMap(s -> StageCodeUtil.variantsForDbMatch(s).stream())
                .distinct()
                .collect(Collectors.toList()));
        monthlyChange.setSignedSettled(Math.toIntExact(enterpriseMapper.selectCount(signedQuery)));
        
        response.setMonthlyChange(monthlyChange);
        return response;
    }
    
    @Override
    public List<FunnelStageResponse> getFunnelStats() {
        String cacheKey = CACHE_PREFIX + "funnel";
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return objectMapper.convertValue(cached, new TypeReference<List<FunnelStageResponse>>() {});
        }

        List<FunnelStageResponse> result = doGetFunnelStats();
        redisTemplate.opsForValue().set(cacheKey, result, CACHE_TTL_MINUTES, TimeUnit.MINUTES);
        return result;
    }

    private List<FunnelStageResponse> doGetFunnelStats() {
        List<Map<String, Object>> stageCounts = enterpriseMapper.countByStage();
        Map<String, Integer> stageMap = new HashMap<>();
        for (Map<String, Object> item : stageCounts) {
            String stage = (String) item.get("stage");
            Long count = (Long) item.get("count");
            if (stage != null && count != null) {
                String key = StageCodeUtil.normalize(stage);
                stageMap.merge(key, count.intValue(), Integer::sum);
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
        String cacheKey = CACHE_PREFIX + "districts";
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return objectMapper.convertValue(cached, new TypeReference<List<DistrictStatsResponse>>() {});
        }

        List<DistrictStatsResponse> result = doGetDistrictStats();
        redisTemplate.opsForValue().set(cacheKey, result, CACHE_TTL_MINUTES, TimeUnit.MINUTES);
        return result;
    }

    private List<DistrictStatsResponse> doGetDistrictStats() {
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
        String cacheKey = CACHE_PREFIX + "industries:l1-full";
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return objectMapper.convertValue(cached, new TypeReference<List<IndustryStatsResponse>>() {});
        }

        List<IndustryStatsResponse> result = doGetIndustryStats();
        redisTemplate.opsForValue().set(cacheKey, result, CACHE_TTL_MINUTES, TimeUnit.MINUTES);
        return result;
    }

    private List<IndustryStatsResponse> doGetIndustryStats() {
        List<Map<String, Object>> industryCounts = enterpriseMapper.countByIndustry();
        Map<String, Integer> l1Counts = new LinkedHashMap<>();
        for (Map<String, Object> item : industryCounts) {
            Object rawId = item.get("industryId");
            if (rawId == null) {
                rawId = item.get("industry_id");
            }
            Integer industryId = rawId == null ? null : ((Number) rawId).intValue();
            int count = ((Number) item.get("count")).intValue();
            String l1 = dictionaryCache.resolveLevel1IndustryName(industryId);
            l1Counts.merge(l1, count, Integer::sum);
        }
        List<IndustryStatsResponse> ordered = buildIndustryStatsWithFullAxis(l1Counts);
        int total = ordered.stream().mapToInt(IndustryStatsResponse::getCount).sum();
        for (IndustryStatsResponse r : ordered) {
            r.setPercentage(total > 0 ? Math.round(r.getCount() * 1000.0 / total) / 10.0 : 0);
        }
        return ordered;
    }

    /**
     * 与数据分析页一致：未分类 + 字典一级行业（零值占位）+ 其余名称
     */
    private List<IndustryStatsResponse> buildIndustryStatsWithFullAxis(Map<String, Integer> industryMap) {
        List<String> level1Ordered = dictionaryCache.getLevel1IndustryNamesInOrder();
        List<IndustryStatsResponse> result = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        result.add(new IndustryStatsResponse("未分类", industryMap.getOrDefault("未分类", 0), 0.0));
        seen.add("未分类");
        for (String name : level1Ordered) {
            if (name == null || name.isBlank() || "未分类".equals(name)) {
                continue;
            }
            result.add(new IndustryStatsResponse(name, industryMap.getOrDefault(name, 0), 0.0));
            seen.add(name);
        }
        List<Map.Entry<String, Integer>> extras = industryMap.entrySet().stream()
                .filter(e -> !seen.contains(e.getKey()))
                .sorted((a, b) -> b.getValue() - a.getValue())
                .collect(Collectors.toList());
        for (Map.Entry<String, Integer> e : extras) {
            result.add(new IndustryStatsResponse(e.getKey(), e.getValue(), 0.0));
        }
        return result;
    }
    
    @Override
    public PendingFollowUpsResponse getPendingFollowUps() {
        String cacheKey = CACHE_PREFIX + "pending-follow-ups";
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return objectMapper.convertValue(cached, PendingFollowUpsResponse.class);
        }

        PendingFollowUpsResponse result = doGetPendingFollowUps();
        redisTemplate.opsForValue().set(cacheKey, result, CACHE_TTL_MINUTES, TimeUnit.MINUTES);
        return result;
    }

    private PendingFollowUpsResponse doGetPendingFollowUps() {
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
            overdueList = new ArrayList<>(overdueList.subList(0, 10));
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

    @Override
    public List<MonthlyTrendResponse> getMonthlyTrend() {
        String cacheKey = CACHE_PREFIX + "monthly-trend";
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return objectMapper.convertValue(cached, new TypeReference<List<MonthlyTrendResponse>>() {});
        }

        List<MonthlyTrendResponse> result = doGetMonthlyTrend();
        redisTemplate.opsForValue().set(cacheKey, result, CACHE_TTL_MINUTES, TimeUnit.MINUTES);
        return result;
    }

    private List<MonthlyTrendResponse> doGetMonthlyTrend() {
        LocalDateTime startDate = LocalDate.now().minusMonths(11).withDayOfMonth(1).atStartOfDay();
        List<Map<String, Object>> rawData = enterpriseMapper.countMonthlyTrend(startDate);

        Map<String, Map<String, Object>> dataMap = new LinkedHashMap<>();
        for (Map<String, Object> item : rawData) {
            dataMap.put((String) item.get("month"), item);
        }

        List<MonthlyTrendResponse> result = new ArrayList<>();
        LocalDate cursor = LocalDate.now().minusMonths(11).withDayOfMonth(1);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM");
        for (int i = 0; i < 12; i++) {
            String monthKey = cursor.format(fmt);
            Map<String, Object> row = dataMap.get(monthKey);
            int total = 0;
            int signed = 0;
            if (row != null) {
                total = ((Number) row.get("total")).intValue();
                signed = ((Number) row.get("signed_count")).intValue();
            }
            String label = cursor.getMonthValue() + "月";
            result.add(new MonthlyTrendResponse(label, total, signed));
            cursor = cursor.plusMonths(1);
        }
        return result;
    }

    @Override
    public void evictAllCache() {
        Set<String> keys = redisTemplate.keys(CACHE_PREFIX + "*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
            log.info("已清除看板缓存，共{}个key", keys.size());
        }
    }
}
