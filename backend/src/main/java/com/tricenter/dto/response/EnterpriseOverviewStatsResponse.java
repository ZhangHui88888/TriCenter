package com.tricenter.dto.response;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 企业管理页顶部概览统计（与列表筛选条件一致，不按分页切片）
 */
@Data
public class EnterpriseOverviewStatsResponse {

    /** 当前筛选条件下企业总数 */
    private long totalCount;

    /** 有明确需求（阶段 HAS_DEMAND）企业数 */
    private long hasDemandCount;

    /** 已签约（阶段 SIGNED）企业数 */
    private long signedCount;

    /**
     * 出口总贸易额合计（万元）：对筛选结果内「上年外贸营业额」非空记录求和
     */
    private BigDecimal totalExportRevenueWan;

    /**
     * 线下出口贸易额合计（万元）：未开展跨境电商（has_cross_border ≠ 1）企业的上年外贸营业额之和
     */
    private BigDecimal offlineExportRevenueWan;

    /**
     * 线上跨境电商出口贸易额合计（万元）：开展跨境电商（has_cross_border = 1）企业的上年外贸营业额之和
     */
    private BigDecimal onlineCrossBorderExportRevenueWan;
}
