package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tricenter.entity.MarketReport;
import com.tricenter.mapper.MarketReportMapper;
import com.tricenter.service.MarketReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;

/**
 * 市场调研报告服务实现（与 market_reports 表结构一致：一企业一行，basic/deep JSON）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MarketReportServiceImpl implements MarketReportService {

    private final MarketReportMapper marketReportMapper;
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Override
    public MarketReport create(Long enterpriseId, Long createdBy) {
        MarketReport report = new MarketReport();
        report.setEnterpriseId(enterpriseId != null ? enterpriseId.intValue() : null);
        report.setBasicReportData(Collections.emptyMap());
        report.setDeepReportData(Collections.emptyMap());
        LocalDateTime now = LocalDateTime.now();
        report.setCreatedAt(now);
        report.setUpdatedAt(now);
        // createdBy：当前表无此字段，忽略
        marketReportMapper.insert(report);
        return report;
    }

    @Override
    public MarketReport getById(Long id) {
        return marketReportMapper.selectById(id);
    }

    @Override
    public Page<MarketReport> getByEnterpriseId(Long enterpriseId, int page, int size) {
        Page<MarketReport> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<MarketReport> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MarketReport::getEnterpriseId, enterpriseId != null ? enterpriseId.intValue() : null)
                .orderByDesc(MarketReport::getCreatedAt);
        return marketReportMapper.selectPage(pageParam, wrapper);
    }

    @Override
    public void updateReportData(Long id, String reportData) {
        MarketReport report = new MarketReport();
        report.setId(id);
        try {
            report.setBasicReportData(OBJECT_MAPPER.readValue(reportData, Object.class));
        } catch (JsonProcessingException e) {
            log.warn("updateReportData JSON 解析失败，按字符串存储: {}", e.getMessage());
            report.setBasicReportData(reportData);
        }
        report.setBasicGeneratedAt(LocalDateTime.now());
        marketReportMapper.updateById(report);
    }

    @Override
    public void updateStatus(Long id, String status) {
        // 表结构已无 status 字段，保留接口兼容，不写库
        log.debug("updateStatus 已忽略（market_reports 无 status 列）: id={}, status={}", id, status);
    }

    @Override
    public void updateAiSections(Long id, String aiGeneratedSections) {
        MarketReport report = new MarketReport();
        report.setId(id);
        try {
            report.setDeepReportData(OBJECT_MAPPER.readValue(aiGeneratedSections, Object.class));
        } catch (JsonProcessingException e) {
            log.warn("updateAiSections JSON 解析失败，按字符串存储: {}", e.getMessage());
            report.setDeepReportData(aiGeneratedSections);
        }
        report.setDeepGeneratedAt(LocalDateTime.now());
        marketReportMapper.updateById(report);
    }

    @Override
    public void delete(Long id) {
        marketReportMapper.deleteById(id);
    }
}
