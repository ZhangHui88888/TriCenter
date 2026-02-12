package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tricenter.common.exception.BusinessException;
import com.tricenter.common.result.PageResult;
import com.tricenter.dto.request.FollowUpCreateRequest;
import com.tricenter.dto.request.FollowUpQueryRequest;
import com.tricenter.dto.request.FollowUpUpdateRequest;
import com.tricenter.dto.response.FollowUpResponse;
import com.tricenter.dto.response.FollowUpStatsResponse;
import com.tricenter.entity.Enterprise;
import com.tricenter.entity.FollowUpRecord;
import com.tricenter.entity.StageChangeLog;
import com.tricenter.entity.User;
import com.tricenter.mapper.EnterpriseMapper;
import com.tricenter.mapper.FollowUpRecordMapper;
import com.tricenter.mapper.StageChangeLogMapper;
import com.tricenter.mapper.UserMapper;
import com.tricenter.service.FollowUpService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 跟进记录服务实现
 */
@Service
@RequiredArgsConstructor
public class FollowUpServiceImpl implements FollowUpService {

    private final FollowUpRecordMapper followUpRecordMapper;
    private final EnterpriseMapper enterpriseMapper;
    private final UserMapper userMapper;
    private final StageChangeLogMapper stageChangeLogMapper;

    @Override
    public PageResult<FollowUpResponse> getFollowUpList(FollowUpQueryRequest request) {
        Page<FollowUpRecord> page = new Page<>(request.getPage(), request.getPageSize());
        
        LambdaQueryWrapper<FollowUpRecord> wrapper = new LambdaQueryWrapper<>();
        
        // 关键词搜索（搜索跟进内容）
        if (StringUtils.hasText(request.getKeyword())) {
            wrapper.like(FollowUpRecord::getContent, request.getKeyword());
        }
        
        // 按跟进类型筛选
        if (StringUtils.hasText(request.getType())) {
            wrapper.eq(FollowUpRecord::getFollowType, request.getType());
        }
        
        // 按企业ID筛选
        if (request.getEnterpriseId() != null) {
            wrapper.eq(FollowUpRecord::getEnterpriseId, request.getEnterpriseId());
        }
        
        // 按跟进日期倒序
        wrapper.orderByDesc(FollowUpRecord::getFollowDate)
               .orderByDesc(FollowUpRecord::getCreatedAt);
        
        Page<FollowUpRecord> result = followUpRecordMapper.selectPage(page, wrapper);
        
        List<FollowUpResponse> list = result.getRecords().stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
        
        return PageResult.of(list, result.getTotal(), request.getPage(), request.getPageSize());
    }

    @Override
    public List<FollowUpResponse> getFollowUpsByEnterpriseId(Integer enterpriseId) {
        checkEnterpriseExists(enterpriseId);
        
        List<FollowUpRecord> records = followUpRecordMapper.selectByEnterpriseId(enterpriseId);
        
        return records.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FollowUpResponse createFollowUp(FollowUpCreateRequest request, Integer currentUserId) {
        // 检查企业是否存在
        Enterprise enterprise = enterpriseMapper.selectById(request.getEnterpriseId());
        if (enterprise == null || enterprise.getIsDeleted() == 1) {
            throw new BusinessException("企业不存在");
        }
        
        // 创建跟进记录
        FollowUpRecord record = new FollowUpRecord();
        record.setEnterpriseId(request.getEnterpriseId());
        record.setFollowType(request.getFollowType());
        record.setFollowDate(request.getFollowDate());
        record.setContent(request.getContent());
        record.setStatus(request.getStatus());
        record.setNextPlan(request.getNextPlan());
        record.setFollowerId(currentUserId);
        
        // 如果需要变更阶段
        if (StringUtils.hasText(request.getStageAfter())) {
            String stageBefore = enterprise.getStage();
            record.setStageFrom(stageBefore);
            record.setStageTo(request.getStageAfter());
            
            // 更新企业阶段
            enterprise.setStage(request.getStageAfter());
            enterpriseMapper.updateById(enterprise);
        }
        
        followUpRecordMapper.insert(record);
        
        // 如果有阶段变更，记录变更日志
        if (StringUtils.hasText(request.getStageAfter())) {
            StageChangeLog log = new StageChangeLog();
            log.setEnterpriseId(request.getEnterpriseId());
            log.setStageFrom(record.getStageFrom());
            log.setStageTo(record.getStageTo());
            log.setOperatorId(currentUserId);
            log.setFollowUpId(record.getId());
            stageChangeLogMapper.insert(log);
        }
        
        return convertToResponse(record);
    }

    @Override
    @Transactional
    public FollowUpResponse updateFollowUp(Integer id, FollowUpUpdateRequest request) {
        FollowUpRecord record = followUpRecordMapper.selectById(id);
        if (record == null) {
            throw new BusinessException("跟进记录不存在");
        }
        
        if (StringUtils.hasText(request.getFollowType())) {
            record.setFollowType(request.getFollowType());
        }
        if (request.getFollowDate() != null) {
            record.setFollowDate(request.getFollowDate());
        }
        if (StringUtils.hasText(request.getContent())) {
            record.setContent(request.getContent());
        }
        if (request.getStatus() != null) {
            record.setStatus(request.getStatus());
        }
        if (request.getNextPlan() != null) {
            record.setNextPlan(request.getNextPlan());
        }
        
        followUpRecordMapper.updateById(record);
        
        return convertToResponse(record);
    }

    @Override
    @Transactional
    public void deleteFollowUp(Integer id) {
        FollowUpRecord record = followUpRecordMapper.selectById(id);
        if (record == null) {
            throw new BusinessException("跟进记录不存在");
        }
        
        followUpRecordMapper.deleteById(id);
    }

    @Override
    public FollowUpStatsResponse getFollowUpStats() {
        FollowUpStatsResponse stats = new FollowUpStatsResponse();
        
        LocalDate today = LocalDate.now();
        
        // 本月第一天和最后一天
        LocalDate monthStart = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate monthEnd = today.with(TemporalAdjusters.lastDayOfMonth());
        
        // 本周第一天（周一）和最后一天（周日）
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        
        // 统计本月跟进数
        stats.setMonthlyCount(followUpRecordMapper.countByDateRange(monthStart, monthEnd));
        
        // 统计本周跟进数
        stats.setWeeklyCount(followUpRecordMapper.countByDateRange(weekStart, weekEnd));
        
        // 统计今日跟进数
        stats.setDailyCount(followUpRecordMapper.countByDateRange(today, today));
        
        // 统计待跟进企业数（超过30天未跟进的企业）
        stats.setPendingCount(countPendingEnterprises());
        
        return stats;
    }
    
    /**
     * 统计超过30天未跟进的企业数
     */
    private int countPendingEnterprises() {
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        
        // 获取所有未删除的企业
        List<Enterprise> enterprises = enterpriseMapper.selectList(
            new LambdaQueryWrapper<Enterprise>()
                .eq(Enterprise::getIsDeleted, 0)
        );
        
        int count = 0;
        for (Enterprise enterprise : enterprises) {
            LocalDate lastFollowUp = followUpRecordMapper.getLastFollowUpDate(enterprise.getId());
            if (lastFollowUp == null || lastFollowUp.isBefore(thirtyDaysAgo)) {
                count++;
            }
        }
        
        return count;
    }
    
    private void checkEnterpriseExists(Integer enterpriseId) {
        Enterprise enterprise = enterpriseMapper.selectById(enterpriseId);
        if (enterprise == null || enterprise.getIsDeleted() == 1) {
            throw new BusinessException("企业不存在");
        }
    }
    
    private FollowUpResponse convertToResponse(FollowUpRecord record) {
        FollowUpResponse response = new FollowUpResponse();
        response.setId(record.getId());
        response.setEnterpriseId(record.getEnterpriseId());
        response.setFollowDate(record.getFollowDate());
        response.setFollowType(record.getFollowType());
        response.setContent(record.getContent());
        response.setStatus(record.getStatus());
        response.setNextPlan(record.getNextPlan());
        response.setStageFrom(record.getStageFrom());
        response.setStageTo(record.getStageTo());
        response.setCreatedAt(record.getCreatedAt());
        
        // 获取企业名称
        Enterprise enterprise = enterpriseMapper.selectById(record.getEnterpriseId());
        if (enterprise != null) {
            response.setEnterpriseName(enterprise.getName());
        }
        
        // 获取跟进人姓名
        if (record.getFollowerId() != null) {
            User user = userMapper.selectById(record.getFollowerId());
            if (user != null) {
                response.setFollowerName(user.getName());
            }
        }
        
        return response;
    }
}
