package com.tricenter.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

/**
 * 数据分析页聚合统计响应（替代前端全量拉取+JS统计）
 */
@Data
public class AnalysisStatsResponse {

    private int totalCount;
    private List<NameCount> districtStats;
    private List<NameCount> typeStats;
    private List<NameCount> platformStats;
    private List<NameCount> marketStats;
    private List<NameCount> industryStats;
    private List<FunnelItem> funnelStats;

    @Data
    @AllArgsConstructor
    public static class FunnelItem {
        private String code;
        private String name;
        private int count;
    }

    @Data
    @AllArgsConstructor
    public static class NameCount {
        private String name;
        private int count;
    }
}
