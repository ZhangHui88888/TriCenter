package com.tricenter.dto.request;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 企业查询请求
 */
@Data
public class EnterpriseQueryRequest {
    
    /** 关键词（企业名称模糊搜索） */
    private String keyword;

    /** 统一社会信用代码（模糊） */
    private String creditCodeKeyword;

    /** 详细地址（模糊） */
    private String addressKeyword;

    /** 官网 URL（模糊） */
    private String websiteKeyword;

    /** ISO 认证（模糊） */
    private String isoCertificationsKeyword;

    /** AEO 认证等级（模糊） */
    private String aeoCertificationKeyword;

    /** 其他资质证书（模糊） */
    private String otherCertificationsKeyword;
    
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

    /** 跨境营收(万元) 下限（含） */
    private BigDecimal crossBorderRevenueMinWan;

    /** 跨境营收(万元) 上限（含） */
    private BigDecimal crossBorderRevenueMaxWan;
    
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

    /** 产品品类ID（关联 product_categories 表） */
    private Integer productCategoryId;

    /** 主要销售区域ID：企业主表 target_region_ids 含该 ID（与数据分析地图统计口径一致） */
    private Integer targetRegionId;

    /** 主要销售国家：企业主表 target_country_ids 含该值（与数据分析地图统计口径一致） */
    private String targetCountryCode;

    /** 产品认证ID（JSON_CONTAINS 匹配 enterprise_products.certification_ids） */
    private Integer productCertificationId;

    /** 最近跟进时间筛选，正数表示X天内，负数表示超过X天 */
    private Integer lastFollowupDays;

    /** 需求ID，多个逗号分隔 */
    private String requirementIds;

    /** 主要跨境平台关键词，多个逗号分隔 */
    private String mainPlatforms;

    /** 目标市场关键词，多个逗号分隔 */
    private String targetMarkets;

    /** 是否开展外贸（1=是，0=否） */
    private Integer hasForeignTrade;

    /** 外贸模式ID */
    private Integer tradeModeId;

    /** 是否有进出口资质（1=是，0=否） */
    private Integer hasExportQualification;

    /** 外贸业务团队模式ID */
    private Integer tradeTeamModeId;

    /** 外贸团队人数范围（如 "1-3人"） */
    private String tradeTeamSize;

    /** 跨境团队规模范围（如 "1-3人"） */
    private String crossBorderTeamSize;

    /** 跨境物流模式，多个逗号分隔 */
    private String logisticsMode;

    /** 支付结算方式，多个逗号分隔 */
    private String paymentMethod;

    /** 报关申报主体模式（自营/代理） */
    private String customsDeclarationMode;

    /** 是否有国内电商经验（1=是，0=否） */
    private Integer hasDomesticEcommerce;

    /** 是否有海外分销商（1=是，0=否） */
    private Integer hasOverseasDistributors;

    /** 跨境业务占比 */
    private String crossBorderRatio;

    /** 愿意投入转型程度（高/中/低） */
    private String investmentWillingness;

    /** 录入日期开始（含） */
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate createdDateStart;

    /** 录入日期结束（含） */
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate createdDateEnd;

    /** 页码 */
    private Integer page = 1;
    
    /** 每页数量 */
    private Integer pageSize = 10;
}
