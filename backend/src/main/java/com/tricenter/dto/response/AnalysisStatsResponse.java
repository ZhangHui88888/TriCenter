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
    /** 全球地图用：企业主表「主要销售国家」汇总（每家企业在同一国家仅计 1 次） */
    private List<NameCount> salesCountryStats;
    /** 全球地图用：企业主表「主要销售区域」汇总（字典标签，每家企业在同一区域仅计 1 次） */
    private List<NameCount> salesRegionStats;
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
