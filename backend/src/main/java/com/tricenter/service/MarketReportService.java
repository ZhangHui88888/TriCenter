package com.tricenter.service;

import com.tricenter.entity.MarketReport;

import java.util.Map;

/**
 * 市场调研报告服务接口
 */
public interface MarketReportService {

    MarketReport getByEnterpriseId(Integer enterpriseId);

    void upsert(Integer enterpriseId, String version, Map<String, Object> reportData);
}
