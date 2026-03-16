package com.tricenter.dto.request;

import lombok.Data;

/**
 * 企业查询请求
 */
@Data
public class EnterpriseQueryRequest {
    
    /** 关键词（企业名称模糊搜索） */
    private String keyword;
    
    /** 漏斗阶段 */
    private String stage;
    
    /** 所属区域 */
    private String district;

    /** 省份 */
    private String province;

    /** 城市 */
    private String city;
    
    /** 行业ID */
    private Integer industryId;
    
    /** 企业类型 */
    private String enterpriseType;
    
    /** 人员规模ID */
    private Integer staffSizeId;

    /** 国内营收ID */
    private Integer domesticRevenueId;

    /** 跨境营收ID */
    private Integer crossBorderRevenueId;
    
    /** 企业来源ID */
    private Integer sourceId;
    
    /** 是否开展跨境电商 */
    private Integer hasCrossBorder;
    
    /** 是否在用ERP */
    private Integer usingErp;

    /** 跨境转型意愿 */
    private String transformationWillingness;

    /** 设备自动化程度ID */
    private Integer automationLevelId;

    /** 原材料本地采购比例 */
    private String localProcurementRatio;

    /** 物流合作方ID，多个逗号分隔 */
    private String logisticsPartnerIds;

    /** 最近跟进时间筛选，正数表示X天内，负数表示超过X天 */
    private Integer lastFollowupDays;

    /** 需求ID，多个逗号分隔 */
    private String requirementIds;

    /** 主要跨境平台关键词，多个逗号分隔 */
    private String mainPlatforms;

    /** 目标市场关键词，多个逗号分隔 */
    private String targetMarkets;
    
    /** 页码 */
    private Integer page = 1;
    
    /** 每页数量 */
    private Integer pageSize = 10;
}
