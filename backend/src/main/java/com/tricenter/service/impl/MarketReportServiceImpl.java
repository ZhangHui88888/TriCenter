package com.tricenter.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tricenter.entity.MarketReport;
import com.tricenter.mapper.MarketReportMapper;
import com.tricenter.common.exception.BusinessException;
import com.tricenter.security.CityContext;
import com.tricenter.service.CityAccessService;
import com.tricenter.service.MarketReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * 市场调研报告服务实现（与 market_reports 表结构一致：一企业一行，basic/deep JSON）
 */
@Service
@RequiredArgsConstructor
public class MarketReportServiceImpl implements MarketReportService {

    private final MarketReportMapper marketReportMapper;
    private final CityContext cityContext;
    private final CityAccessService cityAccessService;
    private final ObjectMapper objectMapper;

    @Override
    public MarketReport getByEnterpriseId(Integer enterpriseId) {
        requireEnterpriseId(enterpriseId);
        cityAccessService.requireEnterprise(enterpriseId, cityContext.requireCityId());
        return marketReportMapper.selectOne(
                new LambdaQueryWrapper<MarketReport>()
                        .eq(MarketReport::getEnterpriseId, enterpriseId));
    }

    @Override
    @Transactional
    public void upsert(Integer enterpriseId, String version, Map<String, Object> reportData) {
        requireEnterpriseId(enterpriseId);
        if (reportData == null || reportData.isEmpty()) {
            throw BusinessException.badRequest("报告内容不能为空");
        }
        cityAccessService.requireEnterprise(enterpriseId, cityContext.requireCityId());

        final String reportJson;
        try {
            reportJson = objectMapper.writeValueAsString(reportData);
        } catch (Exception e) {
            throw BusinessException.badRequest("报告内容不是有效的 JSON 对象");
        }

        switch (version) {
            case "basic" -> marketReportMapper.upsertBasic(enterpriseId, reportJson);
            case "deep" -> marketReportMapper.upsertDeep(enterpriseId, reportJson);
            default -> throw BusinessException.badRequest("version 必须是 basic 或 deep");
        }
    }

    private void requireEnterpriseId(Integer enterpriseId) {
        if (enterpriseId == null || enterpriseId <= 0) {
            throw BusinessException.badRequest("enterpriseId 必须是正整数");
        }
    }
}
