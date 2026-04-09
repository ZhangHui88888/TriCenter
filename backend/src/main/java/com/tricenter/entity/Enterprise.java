package com.tricenter.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 企业实体
 */
@Data
@TableName(value = "enterprises", autoResultMap = true)
public class Enterprise {
    
    @TableId(type = IdType.AUTO)
    private Integer id;
    
    /** 企业名称 */
    private String name;
    
    /** 统一社会信用代码 */
    private String creditCode;
    
    /** 成立日期 */
    private java.time.LocalDate establishedDate;
    
    /** 注册资本（如"500万元"） */
    private String registeredCapital;
    
    /** 省 */
    private String province;
    
    /** 市 */
    private String city;
    
    /** 区(所属区域) */
    private String district;
    
    /** 详细地址 */
    private String address;
    
    /** 行业分类ID */
    private Integer industryId;
    
    /** 企业类型 */
    private String enterpriseType;
    
    /** 人员规模ID */
    private Integer staffSizeId;
    
    /** 官网 */
    private String website;
    
    /** 国内营收ID */
    @TableField(updateStrategy = FieldStrategy.ALWAYS)
    private Integer domesticRevenueId;

    /** 国内营收(万元)，精确数值；与 domesticRevenueId 二选一优先使用本字段 */
    @TableField(updateStrategy = FieldStrategy.ALWAYS)
    private BigDecimal domesticRevenueWan;
    
    /** 企业来源ID */
    private Integer sourceId;
    
    /** 漏斗阶段 */
    private String stage;
    
    // ========== 品牌信息 ==========
    /** 是否有自主品牌 */
    private Integer hasOwnBrand;
    
    /** 品牌名称列表 */
    private String brandNames;
    
    // ========== 外贸信息 ==========
    /** 主要销售区域ID数组 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<Integer> targetRegionIds;
    
    /** 主要销售国家代码数组 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<String> targetCountryIds;
    
    /** 外贸模式ID */
    private Integer tradeModeId;
    
    /** 是否有进出口资质 */
    private Integer hasImportExportLicense;
    
    /** ISO认证情况 */
    private String isoCertifications;
    
    /** 海关AEO认证等级 */
    private String aeoCertification;
    
    /** 其他资质证书 */
    private String otherCertifications;
    
    /** 报关申报主体模式 */
    private String customsDeclarationMode;
    
    /** 外贸业务团队模式ID */
    private Integer tradeTeamModeId;
    
    /** 外贸团队人数 */
    private Integer tradeTeamSize;
    
    /** 是否有国内电商经验 */
    private Integer hasDomesticEcommerce;
    
    // ========== 外贸业绩分析 ==========
    /** 上年外贸营业额(万元) */
    private BigDecimal lastYearRevenue;
    
    /** 上上年外贸营业额(万元) */
    private BigDecimal yearBeforeLastRevenue;
    
    /** 市场变化 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Object marketChanges;
    
    /** 模式变化 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Object modeChanges;
    
    /** 品类变化 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Object categoryChanges;
    
    /** 增长原因 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Object growthReasons;
    
    /** 下降原因 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Object declineReasons;
    
    // ========== 跨境电商信息 ==========
    /** 是否开展跨境电商 */
    private Integer hasCrossBorder;
    
    /** 跨境业务占比 */
    private String crossBorderRatio;
    
    /** 跨境物流模式ID */
    private String crossBorderLogistics;
    
    /** 支付结算方式ID */
    private String paymentSettlement;
    
    /** 跨境电商团队规模 */
    private Integer crossBorderTeamSize;
    
    /** 是否在用ERP */
    private Integer usingErp;
    
    /** 是否有海外分销商 */
    private Integer hasOverseasDistributors;
    
    /** 跨境转型意愿 */
    private String transformationWillingness;
    
    /** 愿意投入转型程度 */
    private String investmentWillingness;
    
    /** 跨境平台 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Object crossBorderPlatforms;
    
    /** 目标市场及占比 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Object targetMarkets;
    
    // ========== 三中心评估 ==========
    /** 企业服务合作可能性(1-5星) */
    private Integer serviceCooperationRating;
    
    /** 招商入驻合作可能性(1-5星) */
    private Integer investmentCooperationRating;
    
    /** 孵化转型合作可能性(1-5星) */
    private Integer incubationCooperationRating;
    
    /** 品牌营销合作可能性(1-5星) */
    private Integer brandCooperationRating;
    
    /** 人才培训合作可能性(1-5星) */
    private Integer trainingCooperationRating;
    
    /** 跨境整体方案合作可能性(1-5星) */
    private Integer overallCooperationRating;
    
    /** 标杆企业可能性百分比 */
    private Integer benchmarkPossibility;
    
    /** 其它补充说明 */
    private String additionalNotes;
    
    // ========== 政策支持 ==========
    /** 是否享受过政策支持 */
    private Integer hasPolicySupport;
    
    /** 已享受政策列表 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<String> enjoyedPolicies;
    
    // ========== 竞争力信息 ==========
    /** 行业竞争地位 */
    private String competitionPosition;
    
    /** 竞争地位描述 */
    private String competitionDescription;
    
    /** 跨境业务痛点 */
    private String painPoints;

    /** 当前面临风险（标签列表，JSON 数组） */
    @TableField(value = "current_risk_tags", typeHandler = JacksonTypeHandler.class)
    private List<String> currentRiskTags;

    /** 当前面临风险说明 */
    @TableField("risk_description")
    private String riskDescription;
    
    // ========== 三中心合作 ==========
    /** 与三中心合作主要需求 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<String> tricenterDemands;
    
    /** 不考虑合作主要顾虑 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Object tricenterConcerns;
    
    // ========== 需求分析 ==========
    /** 企业画像维度选择 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Object dimensionSelections;
    
    /** 已移除的需求ID列表 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Object removedRequirements;
    
    /** 手动添加到默认清单的需求ID列表 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Object addedRequirements;
    
    /** 自定义需求列表 */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Object customRequirements;
    
    // ========== 跨系统关联 ==========
    /** 关联园区小程序用户ID(booking.users.id) */
    private Integer bookingUserId;
    
    // ========== 系统字段 ==========
    /** 是否删除 */
    @TableLogic
    private Integer isDeleted;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
