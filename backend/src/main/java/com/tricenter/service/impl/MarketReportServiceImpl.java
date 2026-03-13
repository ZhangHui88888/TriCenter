package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tricenter.entity.MarketReport;
import com.tricenter.mapper.MarketReportMapper;
import com.tricenter.service.MarketReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 市场调研报告服务实现
 */
@Service
@RequiredArgsConstructor
public class MarketReportServiceImpl implements MarketReportService {

    private final MarketReportMapper marketReportMapper;

    @Override
    public MarketReport create(Long enterpriseId, Long createdBy) {
        MarketReport report = new MarketReport();
        report.setEnterpriseId(enterpriseId);
        report.setReportNo("MR-" + enterpriseId + "-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")));
        report.setVersion("V1.0");
        report.setStatus("draft");
        report.setReportData("{}");
        report.setCreatedBy(createdBy);
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
        wrapper.eq(MarketReport::getEnterpriseId, enterpriseId)
               .orderByDesc(MarketReport::getCreatedAt);
        return marketReportMapper.selectPage(pageParam, wrapper);
    }

    @Override
    public void updateReportData(Long id, String reportData) {
        MarketReport report = new MarketReport();
        report.setId(id);
        report.setReportData(reportData);
        marketReportMapper.updateById(report);
    }

    @Override
    public void updateStatus(Long id, String status) {
        MarketReport report = new MarketReport();
        report.setId(id);
        report.setStatus(status);
        marketReportMapper.updateById(report);
    }

    @Override
    public void updateAiSections(Long id, String aiGeneratedSections) {
        MarketReport report = new MarketReport();
        report.setId(id);
        report.setAiGeneratedSections(aiGeneratedSections);
        marketReportMapper.updateById(report);
    }

    @Override
    public void delete(Long id) {
        marketReportMapper.deleteById(id);
    }
}
