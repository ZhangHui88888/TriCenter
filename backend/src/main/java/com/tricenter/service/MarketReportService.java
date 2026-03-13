package com.tricenter.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tricenter.entity.MarketReport;

/**
 * 市场调研报告服务接口
 */
public interface MarketReportService {

    /**
     * 创建报告
     */
    MarketReport create(Long enterpriseId, Long createdBy);

    /**
     * 获取报告详情
     */
    MarketReport getById(Long id);

    /**
     * 获取企业的报告列表
     */
    Page<MarketReport> getByEnterpriseId(Long enterpriseId, int page, int size);

    /**
     * 更新报告内容
     */
    void updateReportData(Long id, String reportData);

    /**
     * 更新报告状态
     */
    void updateStatus(Long id, String status);

    /**
     * 更新AI已生成章节
     */
    void updateAiSections(Long id, String aiGeneratedSections);

    /**
     * 删除报告
     */
    void delete(Long id);
}
