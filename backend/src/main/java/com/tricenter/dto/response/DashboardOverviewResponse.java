package com.tricenter.dto.response;

import lombok.Data;

/**
 * 看板概览响应
 */
@Data
public class DashboardOverviewResponse {
    
    /** 企业总数 */
    private Integer totalEnterprises;
    
    /** 潜在企业数 */
    private Integer potentialCount;
    
    /** 有明确需求数 */
    private Integer hasDemandCount;
    
    /** 已签约入驻数（签约+入驻+孵化） */
    private Integer signedSettledCount;
    
    /** 本月变化 */
    private MonthlyChange monthlyChange;
    
    @Data
    public static class MonthlyChange {
        /** 本月新增总数 */
        private Integer total;
        /** 本月新增潜在 */
        private Integer potential;
        /** 本月新增有需求 */
        private Integer hasDemand;
        /** 本月新增签约入驻 */
        private Integer signedSettled;
    }
}
